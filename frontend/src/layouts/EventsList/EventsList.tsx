import { EventViewer } from "../EventViewer/EventViewer";
import { EventsTable } from "../EventsTable/EventsTable";
import { cn } from "@/lib/utils";
import styles from "./EventsList.module.css";
import { TraceEvent } from "@/validators/TraceEvent";
import { ReactNode, useState, useMemo, useEffect, useCallback } from "react";
import { traceThat } from "tracethat.dev";
import { useDebounce } from "@/hooks/useDebounce";
import { EventsSearch } from "@/layouts/EventsSearch/EventsSearch";
import { usePrevious } from "@/hooks/usePrevious";
import { useRemount } from "@/hooks/useRemount";

export type EventSearchCriteria = "eventName" | "eventDetails" | "all";

interface EventsListProps {
  data: TraceEvent[];
  viewerPlaceholder?: ReactNode;
  isSearchBarHidden?: boolean;
}
export function EventsList({ data, viewerPlaceholder, isSearchBarHidden = false }: EventsListProps) {
  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);

  const onEventClose = useCallback(() => {
    setSelectedEventCallId(null);
  }, [setSelectedEventCallId]);

  const [rawSearchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState<EventSearchCriteria>("all");
  const searchValue = useDebounce(rawSearchValue, 600);

  const filteredData = useMemo(() => {
    if (!searchValue) {
      return data;
    }

    return data.filter((item) => {
      const lowerCaseSearchValue = searchValue.toLowerCase();

      const handleDetailsSearch = (details: any) => {
        return JSON.stringify(details).toLowerCase().includes(lowerCaseSearchValue);
      };

      if (searchBy === "eventName") {
        return item.name.toLowerCase().includes(lowerCaseSearchValue);
      } else if (searchBy === "eventDetails") {
        return handleDetailsSearch(item.details);
      } else {
        return item.name.toLowerCase().includes(lowerCaseSearchValue) || handleDetailsSearch(item.details);
      }
    });
  }, [searchValue, searchBy, data]);

  const searchValueByName = searchBy !== "eventDetails" ? searchValue : "";
  const searchValueByDetails = searchBy !== "eventName" ? searchValue : "";

  const isSearchNotFound = searchValue && filteredData.length === 0;

  const previousFirst = usePrevious(filteredData[0]);
  const previousSearchValue = usePrevious(searchValue);

  useEffect(() => {
    if (!filteredData[0]) return;

    if (filteredData[0] != previousFirst || previousSearchValue != searchValue) {
      setSelectedEventCallId(filteredData[0].callId);
    }
  }, [filteredData[0], previousFirst, searchValue, previousSearchValue]);

  const { mounted: viewerMounted, remount: remountViewer } = useRemount();

  useEffect(() => {
    remountViewer();
  }, [searchValue]);

  const onEventSelected = useCallback(
    (value: string | null) => {
      if (searchValue) {
        remountViewer();
      }
      setSelectedEventCallId(value);
    },
    [searchValue],
  );

  return (
    <div className={styles.container}>
      <div className={cn("w-full h-full grid", styles.grid)}>
        <div className="min-h-0 min-w-0 flex flex-col">
          {!isSearchBarHidden && <EventsSearch setSearchValue={setSearchValue} setSearchBy={setSearchBy} />}

          {!isSearchNotFound && (
            <EventsTable
              events={filteredData ? filteredData : data}
              selectedEventCallId={selectedEventCallId}
              setSelectedEventCallId={traceThat(onEventSelected)}
              searchValue={searchValueByName}
            />
          )}

          {isSearchNotFound && (
            <div className="mt-8">
              <div className=" p-6 max-w-md mx-auto text-center">
                <h2 className="text-xl font-semibold">No Results Found</h2>
                <p className="mt-2 ">
                  No results for: <span className="bg-[mark] text-[marktext]">{searchValue}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        {viewerMounted && (
          <EventViewer
            events={filteredData}
            selectedEventCallId={selectedEventCallId}
            onEventClose={onEventClose}
            viewerPlaceholder={viewerPlaceholder}
            searchValue={searchValueByDetails}
            searchBy={searchBy}
          />
        )}
      </div>
    </div>
  );
}
