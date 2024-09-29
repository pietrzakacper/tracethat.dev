import { useMemo } from "react";
import { TraceEvent } from "@/validators/TraceEvent";

interface UseEventsSearchArguments {
    searchValue: string;
    searchBy: EventSearchCriteria;
    data: TraceEvent[];
}

export type EventSearchCriteria = 'eventName' | 'eventDetails' | 'all';


function flattenAndSearch(obj, searchWord, parent = '', res = []) {
    // Convert searchWord to lowercase for case-insensitive search
    const lowerSearchWord = searchWord.toLowerCase();


    // Check if the current object is an object or an array
    if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            const propName = parent ? `${parent}.${key}` : key;
            // Only flatten if the value is an object or an array
            flattenAndSearch(obj[key], lowerSearchWord, propName, res);
        }
    } else if (typeof obj === 'string' && obj.toLowerCase().includes(lowerSearchWord)) {
        // If the current value is a string and contains the search word (case-insensitive), add the parent path
        res.push(parent);
    }

    return res; // Return an array of found paths
}

function formatResults(paths: string[]) {

    console.log(paths, "paths")

    return paths.map(path => {
        const elements = path.split('.');

        // Check if the last element is a number
        const lastElement = Number(elements[elements.length - 1]);


        if (elements.length === 1 && !isNaN(lastElement)) {
            return Number(lastElement); // If only one element and it's a number, return the number
        }

        if (!isNaN(lastElement)) {
            return elements[elements.length - 2]; // If last element is a number, return the previous element
        }

        if (isNaN(lastElement)) {
            console.log(elements[elements.length - 1], "00000000000000")
            return elements.map(item => [item]);

        }


        return path; // Otherwise return the path as is
    });
}


export const useEventsSearch = ({ searchValue, data, searchBy }: UseEventsSearchArguments) => {
    const searchResult = useMemo(() => {
        let arrayKeyToExpand: string[] = ["root"];

        if (!searchValue) {
            return { filteredData: null, arrayKeyToExpand };
        }

        const filteredData = data.filter((item) => {
            const lowerCaseSearchValue = searchValue.toLowerCase();

            if (searchBy === "eventName") {
                return item.name.toLowerCase().includes(lowerCaseSearchValue);
            } else if (searchBy === "eventDetails") {

                return JSON.stringify(item.details).toLowerCase().includes(lowerCaseSearchValue);
            } else {

                const format = formatResults(flattenAndSearch(item.details, searchValue)).flat();

                arrayKeyToExpand = [...new Set([...arrayKeyToExpand, ...format])];


                return (
                    item.name.toLowerCase().includes(lowerCaseSearchValue) ||
                    JSON.stringify(item.details).toLowerCase().includes(lowerCaseSearchValue)
                );
            }
        });

        console.log(arrayKeyToExpand, "array key to")

        return { filteredData, arrayKeyToExpand };

    }, [searchValue, searchBy, data]);

    return { searchResult };
};
