import { TraceEvent } from "@/validators/TraceEvent";
import { ColumnDef } from "@tanstack/react-table";
import { formatDuration, formatTime } from "@/utils/format";

export const columns: ColumnDef<TraceEvent>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorFn: (row) => row.endEpochMs - row.startEpochMs,
    header: "Duration",
    cell: ({ getValue }) => {
      const duration = getValue<number>();
      return <span className="tabular-nums">{formatDuration(duration)}</span>;
    },
  },
  {
    accessorKey: "startEpochMs",
    header: "Start",
    cell: ({ row }) => {
      const startEpochMs = row.getValue<TraceEvent["startEpochMs"]>("startEpochMs");
      return <span className="tabular-nums">{formatTime(new Date(startEpochMs))}</span>;
    },
  },
  {
    accessorKey: "endEpochMs",
    header: "End",
    cell: ({ row }) => {
      const endEpochMs = row.getValue<TraceEvent["startEpochMs"]>("startEpochMs");
      return <span className="tabular-nums">{formatTime(new Date(endEpochMs))}</span>;
    },
  },
];
