import history from "history/browser";
import type { Location } from "history";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";

export const StringParam = z.string().min(1);
export type StringParam = z.infer<typeof StringParam>;

export const NumberParam = StringParam.pipe(z.coerce.number());
export type NumberParam = z.infer<typeof NumberParam>;

export const BooleanParam = z.string().pipe(z.preprocess((v) => (v === "" ? "true" : v), z.coerce.boolean()));
export type BooleanParam = z.infer<typeof BooleanParam>;

export const OptionalNumberParam = NumberParam.optional();
export type OptionalNumberParam = z.infer<typeof OptionalNumberParam>;
export const OptionalStringParam = StringParam.optional();
export type OptionalStringParam = z.infer<typeof OptionalStringParam>;
export const OptionalBooleanParam = BooleanParam.optional();
export type OptionalBooleanParam = z.infer<typeof OptionalBooleanParam>;

type ParamType =
  | typeof NumberParam
  | typeof StringParam
  | typeof BooleanParam
  | typeof OptionalNumberParam
  | typeof OptionalStringParam
  | typeof OptionalBooleanParam;

function getSearchParam<T extends ParamType>(param: string, location: Location, parseType?: T): z.infer<T> {
  const value = new URLSearchParams(location.search).get(param) ?? undefined;
  const parser = parseType == null ? OptionalStringParam : parseType;

  return parser.parse(value);
}

const LocationContext = createContext<Location | null>(null);
export const LocationContextProvider = LocationContext.Provider;
const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context == null) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }

  return context;
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

export const useSearchParam = <T extends ParamType = typeof OptionalStringParam>(param: string, paramType?: T) => {
  const location = useLocationContext();
  const value = useMemo(() => getSearchParam(param, location, paramType), [param, paramType, location]);

  return [value];
};
