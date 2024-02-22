import { TraceEvent } from "@/validators/TraceEvent";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { columns } from "./EventsTable.columns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getRowBackgroundClassNames } from "@/utils/colors";
import { StringParam, useSearchParam } from "@/hooks/useSearchParam";
import { Highlight, themes } from "prism-react-renderer";
import { useMemo } from "react";

interface EventViewerProps {
  events: TraceEvent[];
  setSelectedEventCallId: (callId: string) => void;
}
export const EventsTable = ({ events, setSelectedEventCallId }: EventViewerProps) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.callId,
  });

  return (
    <Table wrapperClassName={cn("rounded-md border relative overflow-auto h-full")}>
      <TableHeader className="sticky top-0 bg-secondary">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => setSelectedEventCallId(row.id)}
              className={cn(getRowBackgroundClassNames(row.getValue<string>("name")), "cursor-pointer")}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <Snippet />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

const getCodeBlock = (token: string) =>
  `
import { traceThat, registerToken } from "tracethat.dev";

registerToken("${token}")

const hello = (name) => {
  return \`Hello ${name}!\`;
}

traceThat(hello)("world");
`.trim();

const Snippet = () => {
  const [token] = useSearchParam("token", StringParam);
  const code = useMemo(() => getCodeBlock(token), [token]);

  return (
    <Highlight theme={themes.oneLight} code={code} language="ts">
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre className={cn(className, "font-mono text-left py-2 px-3 rounded-sm text-foreground select-text")}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
