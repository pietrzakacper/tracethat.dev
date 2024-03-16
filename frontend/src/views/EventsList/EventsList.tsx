import { useCallback } from "react";
import { EventViewer } from "../../layouts/EventViewer/EventViewer";
import { EventsTable } from "../../layouts/EventsTable/EventsTable";
import { StringParam, useSearchParam } from "@/hooks/useSearchParam";
import { Header } from "@/components/Header";
import { useEventsList } from "@/hooks/useEventsList";

export function EventsList() {
  const [token] = useSearchParam("token", StringParam);
  const { data, selectedEventCallId, setSelectedEventCallId } = useEventsList(token);
  const onEventClose = useCallback(() => {
    setSelectedEventCallId(null);
  }, [setSelectedEventCallId]);

  return (
    <div className="w-full h-full grid grid-cols-[minmax(800px,_1fr)_2fr] grid-rows-layout">
      <Header />
      <div className="border-r min-h-0">
        <EventsTable
          events={data}
          selectedEventCallId={selectedEventCallId}
          setSelectedEventCallId={setSelectedEventCallId}
        />
      </div>
      <div className="min-h-0 min-w-0">
        <EventViewer events={data} selectedEventCallId={selectedEventCallId} onEventClose={onEventClose} />
      </div>
    </div>
  );
}
