import { useMemo } from "react";
import { TraceEvent } from "@/validators/TraceEvent";

interface UseEventsSearchArguments {
    searchValue: string;
    searchBy: EventSearchCriteria;
    data: TraceEvent[];
}

export type EventSearchCriteria = 'eventName' | 'eventDetails' | 'all';


export const useEventsSearch = ({ searchValue, data, searchBy }: UseEventsSearchArguments) => {
    const searchResult = useMemo(() => {

        if (!searchValue) {
            return { filteredData: null };
        }

        const filteredData = data.filter((item) => {
            const lowerCaseSearchValue = searchValue.toLowerCase();

            const handleDetailsSearch = (details: any) => {
                return JSON.stringify(details).toLowerCase().includes(lowerCaseSearchValue);
            };

            if (searchBy === "eventName") {
                return item.name.toLowerCase().includes(lowerCaseSearchValue);
            } else if (searchBy === "eventDetails") {
                return handleDetailsSearch(item.details);
            } else {
                return (
                    item.name.toLowerCase().includes(lowerCaseSearchValue) ||
                    handleDetailsSearch(item.details)
                );
            }
        });

        return { filteredData };

    }, [searchValue, searchBy, data]);

    return { searchResult };
};
