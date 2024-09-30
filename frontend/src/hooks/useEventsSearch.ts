import { useMemo } from "react";
import { TraceEvent } from "@/validators/TraceEvent";

interface UseEventsSearchArguments {
    searchValue: string;
    searchBy: EventSearchCriteria;
    data: TraceEvent[];
}

export type EventSearchCriteria = 'eventName' | 'eventDetails' | 'all';


function getKeysForSearchedValue(obj: any, searchWord: string, parent = '', res: string[] = []) {
    const lowerSearchWord = searchWord.toLowerCase();

    if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            const propName = parent ? `${parent}.${key}` : key;

            if (key.toLowerCase().includes(lowerSearchWord)) {
                res.push(propName);
            }

            getKeysForSearchedValue(obj[key], lowerSearchWord, propName, res);
        }
    } else if (typeof obj === 'string' && obj.toLowerCase().includes(lowerSearchWord)) {
        res.push(parent);
    }

    const result = res.flatMap(item => item.split('.'));

    return result;
}


export const useEventsSearch = ({ searchValue, data, searchBy }: UseEventsSearchArguments) => {
    const searchResult = useMemo(() => {
        let keysNotToCollapse: string[] = ["root"];

        if (!searchValue) {
            return { filteredData: null, keysNotToCollapse };
        }

        const filteredData = data.filter((item) => {
            const lowerCaseSearchValue = searchValue.toLowerCase();

            const handleDetailsSearch = (details: any) => {
                const newkeysNotToCollapse = getKeysForSearchedValue(details, searchValue);
                keysNotToCollapse = [...new Set([...keysNotToCollapse, ...newkeysNotToCollapse])];
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

        return { filteredData, keysNotToCollapse };

    }, [searchValue, searchBy, data]);

    return { searchResult };
};
