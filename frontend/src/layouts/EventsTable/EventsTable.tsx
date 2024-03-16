import { TraceEvent } from "@/validators/TraceEvent";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { columns } from "./EventsTable.columns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getColor } from "@/utils/colors";
import { useHandleTableScroll } from "./EventsTable.hooks";

interface EventViewerProps {
  events: TraceEvent[];
  selectedEventCallId: string | null;
  setSelectedEventCallId?: (callId: string | null) => void;
}
export const EventsTable = ({ events, selectedEventCallId, setSelectedEventCallId }: EventViewerProps) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.callId,
  });

  const iconColumnClassNames = "pr-0";
  const { tableRef, tableWrapperRef } = useHandleTableScroll();

  return (
    <div className={cn("relative overflow-auto h-full [&_*]:overflow-anchor-none")} ref={tableWrapperRef}>
      <Table ref={tableRef}>
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
                  onClick={() => {
                    if (setSelectedEventCallId == null) {
                      return;
                    }

                    if (row.id === selectedEventCallId) {
                      return setSelectedEventCallId(null);
                    }

                    return setSelectedEventCallId(row.id);
                  }}
                  style={
                    {
                      "--row-base": color.base,
                      "--row-rest": color.rest,
                      "--row-hover": color.hover,
                    } as React.CSSProperties
                  }
                  className={cn("bg-[--row-rest] last:animate-in last:fade-in last:duration-500", {
                    ["hover:bg-[--row-hover] cursor-pointer"]: setSelectedEventCallId != null,
                  })}
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
      <div className="!overflow-anchor-auto h-[1px]" />
    </div>
  );
};
