import { StringParam, useSearchParam } from "@/hooks/useSearchParam";
import { Header } from "@/components/Header";
import { useEventsList } from "@/hooks/useEventsList";
import { EventsList } from "@/layouts/EventsList/EventsList";
import { useState, useEffect, useCallback } from "react";
import { Snippet } from "@/components/Snippet/Snippet";

export function TraceWithToken() {
  const [token] = useSearchParam("token", StringParam);
  const { data, clearData } = useEventsList(token);

  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);
  const firstEvent = data[0];
  useEffect(() => {
    if (firstEvent != null) {
      setSelectedEventCallId(firstEvent.callId);
    }
  }, [firstEvent]);

  const onEventClose = useCallback(() => {
    setSelectedEventCallId(null);
  }, [setSelectedEventCallId]);

  return (
    <div className="w-full h-full flex flex-col">
      <Header onClear={clearData} />
      <div className="w-full flex-1 min-h-0">
        <EventsList
          data={data}
          selectedEventCallId={selectedEventCallId}
          onEventClose={onEventClose}
          setSelectedEventCallId={setSelectedEventCallId}
          viewerPlaceholder={
            <div className="min-h-0 min-w-0 flex flex-col">
              <div className="flex flex-1 flex-col p-4 overflow-auto">
                <Snippet token={token} />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
