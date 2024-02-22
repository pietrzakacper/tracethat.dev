import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getColor } from "@/utils/colors";
import { formatDuration, formatTime } from "@/utils/format";
import { TraceEvent } from "@/validators/TraceEvent";
import { useMemo } from "react";
import ReactJson from "react-json-view";

interface EventViewerProps {
  events: TraceEvent[];
  selectedEventCallId: string | null;
}
export const EventViewer = ({ events, selectedEventCallId }: EventViewerProps) => {
  const selectedEvent = useMemo(() => {
    if (selectedEventCallId == null) {
      return undefined;
    }

    return events.find((event) => event.callId === selectedEventCallId);
  }, [events, selectedEventCallId]);

  if (selectedEvent == null) {
    return null;
  }

  const duration = selectedEvent.endEpochMs - selectedEvent.startEpochMs;
  const start = new Date(selectedEvent.startEpochMs);
  const end = new Date(selectedEvent.endEpochMs);

  return (
    <div className="rounded-xl border p-4 h-full">
      <div className={cn("w-full px-4 py-4 rounded-md text-lg", getColor(selectedEvent.name))}>
        {selectedEvent.name}
      </div>

      <div className="flex gap-2 my-3">
        <Badge variant="secondary">duration: {formatDuration(duration)}</Badge>
        <Badge variant="secondary">start: {formatTime(start)}</Badge>
        <Badge variant="secondary">end: {formatTime(end)}</Badge>
      </div>

      <div className="font-mono">
        <ReactJson
          src={selectedEvent.details}
          theme="rjv-default"
          iconStyle="square"
          displayDataTypes={false}
          displayObjectSize={false}
          indentWidth={4}
          enableClipboard={false}
          style={{ fontFamily: "inherit" }}
        />
      </div>
    </div>
  );
};
