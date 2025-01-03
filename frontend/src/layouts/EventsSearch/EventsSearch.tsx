import { useState } from "react";
import { Input } from "@/components/ui/input/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type SearchBy = "eventName" | "eventDetails" | "all";

interface EventsSearchProps {
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSearchBy: React.Dispatch<React.SetStateAction<SearchBy>>;
}

export function EventsSearch({ setSearchValue, setSearchBy }: EventsSearchProps) {
  const [toggleGroupValue, setToggleGroupValue] = useState("all");

  const handleSearchByValue = (eventValue: SearchBy) => {
    if (eventValue) {
      setToggleGroupValue(eventValue);
      setSearchBy(eventValue);
    }
  };

  return (
    <div className="grid py-2 px-4 gap-2 xl:grid-cols-2">
      <Input
        size="lg"
        name="searchValue"
        placeholder="Search"
        onChange={(event) => {
          setSearchValue(event.target.value);
        }}
      />
      <div className="flex gap-2 items-center">
        <ToggleGroup type="single" onValueChange={handleSearchByValue} defaultValue="all" value={toggleGroupValue}>
          <ToggleGroupItem value="all" aria-label="Search by all">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="eventName" aria-label="Search by name">
            Name
          </ToggleGroupItem>
          <ToggleGroupItem value="eventDetails" aria-label="Search by details">
            Details
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
