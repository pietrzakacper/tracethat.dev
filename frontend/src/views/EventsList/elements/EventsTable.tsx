import { TraceEvent } from "@/validators/TraceEvent";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { columns } from "./EventsTable.columns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getRowBackgroundClassNames } from "@/utils/colors";

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

const Snippet = () => {
  const code = `<pre tabindex="0" style="background-color:#fff;"><code><span style="display:flex;"><span>
  </span></span><span style="display:flex;"><span>	<span style="color:#00f">import</span> { <span style="color:#000">traceThat</span>, <span style="color:#000">registerToken</span> } <span style="color:#000">from</span> <span style="color:#5a2">'tracethat.dev'</span>
  </span></span><span style="display:flex;"><span>
  </span></span><span style="display:flex;"><span>	<span style="color:#000">registerToken</span>(<span style="color:#5a2">'test'</span>)
  </span></span><span style="display:flex;"><span>
  </span></span><span style="display:flex;"><span>	<span style="color:#00f">const</span> <span style="color:#000">hello</span> = (<span style="color:#000">name</span>) =&gt; {
  </span></span><span style="display:flex;"><span>		<span style="color:#00f">return</span> <span style="color:#5a2">\`</span><span style="color:#5a2">Hello </span><span style="color:#5a2">\${</span><span style="color:#000">name</span><span style="color:#5a2">}</span><span style="color:#5a2">!</span><span style="color:#5a2">\`</span>
  </span></span><span style="display:flex;"><span>	}
  </span></span><span style="display:flex;"><span>
  </span></span><span style="display:flex;"><span>	<span style="color:#000">traceThat</span>(<span style="color:#000">hello</span>)(<span style="color:#5a2">'world'</span>)
  </span></span><span style="display:flex;"><span>
  </span></span><span style="display:flex;"><span>
  </span></span></code></pre>`;

  return (
    <div>
      <div className="font-mono text-base" dangerouslySetInnerHTML={{ __html: code }} />
    </div>
  );
};
