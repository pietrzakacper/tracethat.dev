
import { useState } from "react";
import { Input } from "@/components/ui/input/input";
import { Root as ToogleGroup, Item as ToogleItem } from '@radix-ui/react-toggle-group';
import styles from "./EventsSearch.module.css";
import { cn } from "@/lib/utils";
import { EventSearchCriteria } from "@/validators/TraceEvent";

interface EventsSearchProps {
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    setSearchBy: React.Dispatch<React.SetStateAction<EventSearchCriteria>>;
    isFilterLoadingData: boolean;
}

export function EventsSearch({ setSearchValue, setSearchBy, isFilterLoadingData }: EventsSearchProps) {
    const [toggleGroupValue, setToggleGroupValue] = useState("all");

    const handleSearchByValue = (eventValue: EventSearchCriteria) => {
        if (eventValue) {
            setToggleGroupValue(() => {
                return eventValue;
            });
            setSearchBy(eventValue);
        }
    }

    return (
        <div className="grid  p-2 gap-4 xl:grid-cols-2">
            <div className="flex gap-2 items-center">
                <span>Search by</span>
                <ToogleGroup
                    className={cn(styles.ToggleGroup)}
                    type="single"
                    defaultValue="all"
                    aria-label="Text alignment"
                    onValueChange={handleSearchByValue}
                    value={toggleGroupValue}
                >
                    <ToogleItem value="eventName" aria-label="Search by name" className={cn(styles.ToggleGroupItem)}> <p> name</p></ToogleItem>
                    <ToogleItem value="eventDetails" aria-label="Search by details" className={cn(styles.ToggleGroupItem)}> details</ToogleItem>
                    <ToogleItem value="all" aria-label="Search by all" className={cn(styles.ToggleGroupItem)}> all</ToogleItem>
                </ToogleGroup>
            </div>

            <Input
                size="lg"
                name="searchValue"
                placeholder="Search"
                onChange={(event) => { setSearchValue(event.target.value) }}
            />
        </div>
    )
}