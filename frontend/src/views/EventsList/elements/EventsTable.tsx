import { TraceEvent } from "@/validators/TraceEvent";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { columns } from "./EventsTable.columns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getColor } from "@/utils/colors";

interface EventViewerProps {
  events: TraceEvent[];
  selectedEventCallId: string | null;
  setSelectedEventCallId: (callId: string) => void;
}
export const EventsTable = ({ events, selectedEventCallId, setSelectedEventCallId }: EventViewerProps) => {
  // TODO: Use useReactTable to handle selection
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.callId,
  });

  const iconColumnClassNames = "pr-0";

  return (
    <Table wrapperClassName={cn("relative overflow-auto h-full")}>
      <TableHeader className="sticky top-0 bg-background">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className={cn({ [iconColumnClassNames]: header.id === "icon" })}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const color = getColor(row.getValue<string>("name"));

            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => setSelectedEventCallId(row.id)}
                style={
                  {
                    "--row-base": color.base,
                    "--row-rest": color.rest,
                    "--row-hover": color.hover,
                  } as React.CSSProperties
                }
                className={cn("bg-[--row-rest]", "hover:bg-[--row-hover]", "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell, i) => {
                  const isSelected = i === 0 && row.id === selectedEventCallId;

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn({
                        [iconColumnClassNames]: cell.column.id === "icon",
                        "select-text": true,
                        "transition-shadow duration-200 ease-in-out": true,
                        "shadow-[inset_0px_0_var(--row-base)]": !isSelected,
                        "shadow-[inset_4px_0_var(--row-base)]": isSelected,
                      })}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
              No events yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
