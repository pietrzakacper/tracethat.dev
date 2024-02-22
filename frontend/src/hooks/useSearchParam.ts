import history from "history/browser";
import type { Location } from "history";
import { useEffect, useState } from "react";
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

  if (parseType == null) {
    return OptionalStringParam.parse(value);
  }

  return parseType.parse(value);
}

export const useSearchParam = <T extends ParamType = typeof OptionalStringParam>(param: string, paramType?: T) => {
  const [value, setValue] = useState(() => getSearchParam(param, history.location, paramType));

  useEffect(() => {
    return history.listen(({ location }) => {
      const newValue = getSearchParam(param, location, paramType);

      setValue(newValue);
    });
  }, [param, paramType]);

  return [value];
};
