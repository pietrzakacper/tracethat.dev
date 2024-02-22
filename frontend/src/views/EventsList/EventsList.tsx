import { useState } from "react";
import { useSSE } from "../../hooks/useSSE";
import { parseTraceEvent } from "../../validators/TraceEvent";
import { EventViewer } from "./elements/EventViewer";
import { EventsTable } from "./elements/EventsTable";
import { StringParam, useSearchParam } from "@/hooks/useSearchParam";

export function EventsList() {
  const [token] = useSearchParam("token", StringParam);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const { data } = useSSE(`/api/events?token=${token}&sessionId=${sessionId}`, parseTraceEvent);
  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);

  if (token == null) {
    return null;
  }

  return (
    <div className="w-full h-full grid grid-cols-2 p-6 gap-6">
      <div className="h-full min-h-0">
        <EventsTable events={data} setSelectedEventCallId={setSelectedEventCallId} />
      </div>
      <div>
        <EventViewer events={data} selectedEventCallId={selectedEventCallId} />
      </div>
    </div>
  );
}
