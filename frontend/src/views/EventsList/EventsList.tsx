import { useEffect, useMemo, useState } from "react";
import { useSSE } from "../../hooks/useSSE";
import { TraceEvent, parseTraceEvent } from "../../validators/TraceEvent";
import { EventViewer } from "./elements/EventViewer";
import { EventsTable } from "./elements/EventsTable";
import { StringParam, useSearchParam } from "@/hooks/useSearchParam";
import { Logo } from "@/components/Logo";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button/button";
import { Github } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export function EventsList() {
  const [token] = useSearchParam("token", StringParam);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const { data } = useSSE(token, sessionId, parseTraceEvent);
  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);

  const sortedData = useMemo(() => {
    const visitedEvents = new Set<string>();

    const sortedData = data.toSorted((a, b) => {
      const startEpochMsA = a.startEpochMs;
      const endEpochMsA = a.endEpochMs;
      const startEpochMsB = b.startEpochMs;
      const endEpochMsB = b.endEpochMs;

      const epochMsA = endEpochMsA || startEpochMsA;
      const epochMsB = endEpochMsB || startEpochMsB;

      return epochMsA - epochMsB;
    });

    const outputData: TraceEvent[] = [];
    for (let i = sortedData.length - 1; i >= 0; i--) {
      const event = sortedData[i];
      if (!visitedEvents.has(event.callId)) {
        outputData.unshift(event);
      }

      visitedEvents.add(event.callId);
    }

    return outputData;
  }, [data]);

  const firstEvent = sortedData[0];
  useEffect(() => {
    if (firstEvent != null) {
      setSelectedEventCallId(firstEvent.callId);
    }
  }, [firstEvent]);

  if (token == null) {
    return null;
  }

  return (
    <div className="w-full h-full grid grid-cols-[minmax(800px,_1fr)_2fr] grid-rows-layout">
      <header className="col-span-full p-4 border-b flex items-center">
        <Link to={{ pathname: "/" }}>
          <Logo />
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" asChild size="icon">
            <a href="https://github.com/pietrzakacper/tracethat.dev" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </header>
      <div className="border-r min-h-0">
        <EventsTable
          events={sortedData}
          selectedEventCallId={selectedEventCallId}
          setSelectedEventCallId={setSelectedEventCallId}
        />
      </div>
      <div className="min-h-0">
        <EventViewer events={sortedData} selectedEventCallId={selectedEventCallId} />
      </div>
    </div>
  );
}
