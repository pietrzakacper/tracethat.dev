import { useEffect, useMemo, useState } from "react"
import { TraceEvent } from "@/validators/TraceEvent";

interface UseEventsSearchArguments {
    searchValue: string,
    searchBy: EventSearchCriteria
    data: TraceEvent[]
}

export type EventSearchCriteria = 'eventName' | 'eventDetails' | 'all';

export const useEventsSearch = ({ searchValue, data, searchBy }: UseEventsSearchArguments) => {
    const [filteredData, setFilteredData] = useState<TraceEvent[] | null>();

    //tu use memo i zwracac filtrowane dane 

    useEffect(() => {

        if (searchValue) {

            const filteredData = data.filter((item) => {

                if (searchBy === "eventName") {
                    return item.name.toLowerCase().includes(searchValue.toLowerCase());
                } else if (searchBy === "eventDetails") {


                    return JSON.stringify(item.details).toLowerCase().includes(searchValue.toLowerCase());
                } else {

                    return item.name.toLowerCase().includes(searchValue.toLowerCase()) || JSON.stringify(item.details).toLowerCase().includes(searchValue.toLowerCase());
                }
            })

            setFilteredData(filteredData as TraceEvent[]);

        } else {
            setFilteredData(null)
        }

    }, [searchValue, searchBy, data]);

    return { filteredData }
}