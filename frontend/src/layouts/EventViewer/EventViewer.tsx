import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getColor } from "@/utils/colors";
import { formatDuration, formatTime } from "@/utils/format";
import { NBSP } from "@/utils/text";
import { TraceEvent } from "@/validators/TraceEvent";
import { Loader2, X } from "lucide-react";
import { ReactNode, useMemo } from "react";
import ReactJson, { ThemeObject } from "react-json-view";

interface EventViewerProps {
  events: TraceEvent[];
  selectedEventCallId: string | null;
  onEventClose: () => void;
  viewerPlaceholder: ReactNode;
}
export const EventViewer = ({ events, selectedEventCallId, onEventClose, viewerPlaceholder }: EventViewerProps) => {
  const selectedEvent = useMemo(() => {
    if (selectedEventCallId == null) {
      return undefined;
    }

    return events.find((event) => event.callId === selectedEventCallId);
  }, [events, selectedEventCallId]);
  const theme = useTheme();
  const viewerTheme = useMemo(() => (theme.theme === "light" ? ONE_LIGHT : ONE_DARK), [theme.theme]);

  if (selectedEvent == null) {
    return viewerPlaceholder;
  }

  const duration = (selectedEvent.endEpochMs ?? 0) - selectedEvent.startEpochMs;
  const start = new Date(selectedEvent.startEpochMs);
  const end = new Date(selectedEvent.endEpochMs ?? 0);
  const { hover, icon: Icon, base } = getColor(selectedEvent.name);

  return (
    <div className="min-h-0 min-w-0">
      <div
        style={{ "--bg-base": hover } as React.CSSProperties}
        className={cn("w-full text-lg border-b flex items-center bg-[--bg-base]")}
      >
        <div className="flex overflow-x-auto items-center flex-1 py-4 pl-4">
          <Icon style={{ color: base }} className={"h-4 w-4 fill-current mr-4 flex-shrink-0"} />
          <div className="select-text">{selectedEvent.name}</div>

          <div className="flex-1 min-w-4" />

          <div className="flex gap-2 items-center">
            <Badge variant="default">
              Duration:{NBSP}
              {selectedEvent.endEpochMs != null ? (
                <span className="select-text tabular-nums">{formatDuration(duration)}</span>
              ) : (
                <Loader2 className="ml-1 h-4 w-4 animate-spin" />
              )}
            </Badge>
            <Badge variant="default">
              Start:{NBSP}
              <span className="select-text tabular-nums">{formatTime(start)}</span>
            </Badge>
            <Badge variant="default">
              End:{NBSP}
              {selectedEvent.endEpochMs != null ? (
                <span className="select-text tabular-nums">{formatTime(end)}</span>
              ) : (
                <Loader2 className="ml-1 h-4 w-4 animate-spin" />
              )}
            </Badge>
          </div>
        </div>
        <div className="py-4 pr-4 flex items-center">
          <div className="w-[1px] h-6 mx-2 bg-primary/50" />
          <Tooltip content="Close event" delayDuration={0}>
            <Button size="icon" className="w-[1.375rem] h-[1.375rem]" onClick={onEventClose}>
              <X className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="p-4 overflow-auto flex-1">
        <div className="font-mono select-text p-4 rounded-sm bg-muted overflow-x-auto w-full">
          <ReactJson
            // Needed to properly handle theme changes
            key={theme.theme}
            src={selectedEvent.details}
            theme={viewerTheme}
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

const ONE_DARK: ThemeObject = {
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
};
const ONE_LIGHT: ThemeObject = {
  base00: "#fafafa",
  base01: "#f0f0f1",
  base02: "#e5e5e6",
  base03: "#a0a1a7",
  base04: "#696c77",
  base05: "#383a42",
  base06: "#202227",
  base07: "#090a0b",
  base08: "#ca1243",
  base09: "#50a14f",
  base0A: "#d75f00",
  base0B: "#c18401",
  base0C: "#0184bc",
  base0D: "#4078f2",
  base0E: "#a626a4",
  base0F: "#986801",
};
