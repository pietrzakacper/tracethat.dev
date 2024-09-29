import { useMemo } from "react";
import { TraceEvent } from "@/validators/TraceEvent";

interface UseEventsSearchArguments {
    searchValue: string;
    searchBy: EventSearchCriteria;
    data: TraceEvent[];
}

export type EventSearchCriteria = 'eventName' | 'eventDetails' | 'all';

export const useEventsSearch = ({ searchValue, data, searchBy }: UseEventsSearchArguments) => {
    const filteredData = useMemo(() => {
        if (!searchValue) {
            return null;
        }

        return data.filter((item) => {
            const lowerCaseSearchValue = searchValue.toLowerCase();

            if (searchBy === "eventName") {
                return item.name.toLowerCase().includes(lowerCaseSearchValue);
            } else if (searchBy === "eventDetails") {
                return JSON.stringify(item.details).toLowerCase().includes(lowerCaseSearchValue);
            } else {
                return (
                    item.name.toLowerCase().includes(lowerCaseSearchValue) ||
                    JSON.stringify(item.details).toLowerCase().includes(lowerCaseSearchValue)
                );
            }
        });
    }, [searchValue, searchBy, data]);

    return { filteredData };
};
