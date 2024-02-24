import { Snippet } from "@/components/Snippet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getColor } from "@/utils/colors";
import { formatDuration, formatTime } from "@/utils/format";
import { NBSP } from "@/utils/text";
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
    return (
      <div className="h-full flex flex-col p-4">
        <Snippet />
      </div>
    );
  }

  const duration = selectedEvent.endEpochMs - selectedEvent.startEpochMs;
  const start = new Date(selectedEvent.startEpochMs);
  const end = new Date(selectedEvent.endEpochMs);
  const { hover, icon: Icon, base } = getColor(selectedEvent.name);

  return (
    <div className="h-full flex flex-col">
      <div
        style={{ "--bg-base": hover } as React.CSSProperties}
        className={cn("w-full px-4 py-4 text-lg border-b flex items-center bg-[--bg-base]")}
      >
        <Icon style={{ color: base }} className={"h-4 w-4 fill-current mr-4"} />
        <div className="select-text">{selectedEvent.name}</div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Badge variant="default">
            Duration:{NBSP}
            <span className="select-text tabular-nums">{formatDuration(duration)}</span>
          </Badge>
          <Badge variant="default">
            Start:{NBSP}
            <span className="select-text tabular-nums">{formatTime(start)}</span>
          </Badge>
          <Badge variant="default">
            End:{NBSP}
            <span className="select-text tabular-nums">{formatTime(end)}</span>
          </Badge>
        </div>
      </div>

      <div className="p-4 overflow-auto flex-1">
        <div className="font-mono select-text p-4 rounded-sm bg-muted">
          <ReactJson
            src={selectedEvent.details}
            theme={{
              base00: "#282c34",
              base01: "#353b45",
              base02: "#3e4451",
              base03: "#545862",
              base04: "#565c64",
              base05: "#abb2bf",
              base06: "#b6bdca",
              base07: "#c8ccd4",
              base08: "#e06c75",
              base09: "#98c379",
              base0A: "#d19a66",
              base0B: "#e5c07b",
              base0C: "#56b6c2",
              base0D: "#61afef",
              base0E: "#c678dd",
              base0F: "#be5046",
            }}
            iconStyle="square"
            displayDataTypes={false}
            displayObjectSize={false}
            indentWidth={4}
            enableClipboard={false}
            style={{ fontFamily: "inherit", background: "none" }}
          />
        </div>
      </div>
    </div>
  );
};
