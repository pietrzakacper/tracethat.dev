import { EventViewer } from "../EventViewer/EventViewer";
import { EventsTable } from "../EventsTable/EventsTable";
import { cn } from "@/lib/utils";
import styles from "./EventsList.module.css";
import { TraceEvent } from "@/validators/TraceEvent";
import { ReactNode } from "react";
import { traceThat } from "tracethat.dev";
import { EventSearchCriteria } from "@/hooks/useEventsSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";
import { EventsSearch } from "@/layouts/EventsSearch/EventsSearch";
import { useEventsSearch } from "@/hooks/useEventsSearch";

interface EventsListProps {
  data: TraceEvent[];
  selectedEventCallId: string | null;
  viewerPlaceholder?: ReactNode;
  onEventClose: () => void;
  setSelectedEventCallId: (value: string | null) => void;
  isSearchBarHidden?: boolean;
}
export function EventsList({
  data,
  selectedEventCallId,
  setSelectedEventCallId,
  onEventClose,
  viewerPlaceholder,
  isSearchBarHidden = false
}: EventsListProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState<EventSearchCriteria>("all");
  const debouncedSearchValue = useDebounce(searchValue, 600)

  const { filteredData } = useEventsSearch({ data, searchValue: debouncedSearchValue, searchBy });

  const searchValueByName = searchBy !== "eventDetails" ? searchValue : "";
  const searchValueByDetails = searchBy !== "eventName" ? searchValue : "";

  const isSearchNotFound = Array.isArray(filteredData) && filteredData.length === 0

  return (
    <div className={styles.container}>
      <div className={cn("w-full h-full grid", styles.grid)}>
        <div className="min-h-0 min-w-0">

          {!isSearchBarHidden &&
            < EventsSearch setSearchValue={setSearchValue} setSearchBy={setSearchBy} />
          }

          {!isSearchNotFound &&
            <EventsTable
              events={filteredData ? filteredData : data}
              selectedEventCallId={selectedEventCallId}
              setSelectedEventCallId={traceThat(setSelectedEventCallId)}
              searchValue={searchValueByName}
            />
          }

          {isSearchNotFound && <div className="mt-8">
            <div className=" p-6 max-w-md mx-auto text-center">
              <h2 className="text-xl font-semibold">
                No Results Found
              </h2>
              <p className="mt-2 ">
                No results for: <span className="bg-[mark] text-[marktext]">{searchValue}</span>
              </p>
            </div>
          </div>
          }

        </div>
        <EventViewer
          events={filteredData ? filteredData : data}
          selectedEventCallId={selectedEventCallId}
          onEventClose={onEventClose}
          viewerPlaceholder={viewerPlaceholder}
          searchValue={searchValueByDetails}
          searchBy={searchBy}
        />
      </div>
    </div>
  );
}
