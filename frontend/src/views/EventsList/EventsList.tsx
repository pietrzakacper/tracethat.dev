import { useEffect, useState } from "react";
import { useSSE } from "../../hooks/useSSE";
import { parseTraceEvent } from "../../validators/TraceEvent";
import { EventViewer } from "./elements/EventViewer";
import { EventsTable } from "./elements/EventsTable";
import { StringParam, useSearchParam } from "@/hooks/useSearchParam";
import { Logo } from "@/components/Logo";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button/button";
import { Github } from "lucide-react";

export function EventsList() {
  const [token] = useSearchParam("token", StringParam);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const { data } = useSSE(`/api/events?token=${token}&sessionId=${sessionId}`, parseTraceEvent);
  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);

  const firstEvent = data[0];
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
        <Button variant="outline" asChild size="icon">
          <a href="https://github.com/pietrzakacper/tracethat.dev" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
          </a>
        </Button>
      </header>
      <div className="border-r min-h-0">
        <EventsTable
          events={data}
          selectedEventCallId={selectedEventCallId}
          setSelectedEventCallId={setSelectedEventCallId}
        />
      </div>
      <div className="min-h-0">
        <EventViewer events={data} selectedEventCallId={selectedEventCallId} />
      </div>
    </div>
  );
}
