import { TraceEvent } from "@/validators/TraceEvent";
import { ColumnDef } from "@tanstack/react-table";
import { formatDuration, formatTime } from "@/utils/format";
import { getColor } from "@/utils/colors";
import { Loader2 } from "lucide-react";

export const columns: ColumnDef<TraceEvent>[] = [
  {
    id: "icon",
    cell: ({ row }) => {
      const { icon: Icon, base } = getColor(row.getValue<string>("name"));
      return <Icon style={{ color: base }} className={"h-4 w-4 fill-current"} />;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorFn: (row) => {
      if (row.endEpochMs == null) {
        return null;
      }

      return row.endEpochMs - row.startEpochMs;
    },
    header: "Duration",
    cell: ({ getValue }) => {
      const duration = getValue<number | null>();
      if (duration === null) {
        return <Loader2 className="ml-3 h-4 w-4 animate-spin text-muted-foreground" />;
      }

      return <span className="tabular-nums text-muted-foreground">{formatDuration(duration)}</span>;
    },
  },
  {
    accessorKey: "startEpochMs",
    header: "Start",
    cell: ({ row }) => {
      const startEpochMs = row.getValue<TraceEvent["startEpochMs"]>("startEpochMs");
      return <span className="tabular-nums text-muted-foreground">{formatTime(new Date(startEpochMs))}</span>;
    },
  },
  {
    accessorKey: "endEpochMs",
    header: "End",
    cell: ({ row }) => {
      const endEpochMs = row.getValue<TraceEvent["endEpochMs"]>("endEpochMs");
      if (endEpochMs == null) {
        return null;
      }

      return <span className="tabular-nums text-muted-foreground">{formatTime(new Date(endEpochMs))}</span>;
    },
  },
];
