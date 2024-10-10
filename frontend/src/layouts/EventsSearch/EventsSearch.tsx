
import { useState } from "react";
import { Input } from "@/components/ui/input/input";
import { EventSearchCriteria } from "@/hooks/useEventsSearch";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"


interface EventsSearchProps {
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    setSearchBy: React.Dispatch<React.SetStateAction<EventSearchCriteria>>;
}

export function EventsSearch({ setSearchValue, setSearchBy }: EventsSearchProps) {
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
                <ToggleGroup type="single" onValueChange={handleSearchByValue} defaultValue="all" value={toggleGroupValue}>
                    <ToggleGroupItem value="eventName" aria-label="Search by name">
                        name
                    </ToggleGroupItem>
                    <ToggleGroupItem value="eventDetails" aria-label="Search by details">
                        details
                    </ToggleGroupItem>
                    <ToggleGroupItem value="all" aria-label="Search by all">
                        all
                    </ToggleGroupItem>
                </ToggleGroup>
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