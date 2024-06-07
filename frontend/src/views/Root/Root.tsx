import { useEffect, useState } from "react";
import { Landing } from "../Landing/Landing";
import { TraceWithToken } from "../TraceWithToken/TraceWithToken";
import history from "history/browser";

export const Root = () => {
  const location = useLocation();
  return location.pathname.includes("events") ? <TraceWithToken /> : <Landing />;
};

export const useLocation = () => {
  const [location, setLocation] = useState(history.location);

  useEffect(() => {
    return history.listen(({ location }) => {
      setLocation(location);
    });
  }, []);

  return location;
};
