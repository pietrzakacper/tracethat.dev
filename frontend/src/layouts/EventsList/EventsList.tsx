import { EventViewer } from "../EventViewer/EventViewer";
import { EventsTable } from "../EventsTable/EventsTable";
import { cn } from "@/lib/utils";
import styles from "./EventsList.module.css";
import { TraceEvent } from "@/validators/TraceEvent";
import { ReactNode } from "react";

interface EventsListProps {
  data: TraceEvent[];
  selectedEventCallId: string | null;
  viewerPlaceholder?: ReactNode;
  onEventClose: () => void;
  setSelectedEventCallId: (value: string | null) => void;
}
export function EventsList({
  data,
  selectedEventCallId,
  setSelectedEventCallId,
  onEventClose,
  viewerPlaceholder,
}: EventsListProps) {
  return (
    <div className={styles.container}>
      <div className={cn("w-full h-full grid", styles.grid)}>
        <div className="min-h-0 min-w-0">
          <EventsTable
            events={data}
            selectedEventCallId={selectedEventCallId}
            setSelectedEventCallId={setSelectedEventCallId}
          />
        </div>
        <EventViewer
          events={data}
          selectedEventCallId={selectedEventCallId}
          onEventClose={onEventClose}
          viewerPlaceholder={viewerPlaceholder}
        />
      </div>
    </div>
  );
}
