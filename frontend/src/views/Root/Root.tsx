import { OptionalStringParam, useSearchParam } from "@/hooks/useSearchParam";
import { Landing } from "../Landing/Landing";
import { TraceWithToken } from "../TraceWithToken/TraceWithToken";

export const Root = () => {
  const [token] = useSearchParam("token", OptionalStringParam);

  return token ? <TraceWithToken /> : <Landing />;
};
