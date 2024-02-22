import { OptionalStringParam, useSearchParam } from "@/hooks/useSearchParam";
import { EventsList } from "../EventsList/EventsList";
import { Landing } from "../Landing/Landing";

export const Root = () => {
  const [token] = useSearchParam("token", OptionalStringParam);

  return token ? <EventsList /> : <Landing />;
};
