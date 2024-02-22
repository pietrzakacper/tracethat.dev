import { safeJSONParse } from "@/utils/safeJSONParse";
import { z } from "zod";

export const TraceEvent = z.object({
  name: z.string(),
  status: z.union([z.literal("ok"), z.literal("error"), z.literal("in-progress")]),
  callId: z.string(),
  startEpochMs: z.number(),
  endEpochMs: z.number(),
  details: z.record(z.any()),
});
export type TraceEvent = z.infer<typeof TraceEvent>;

export const parseTraceEvent = (data: unknown): TraceEvent | null => {
  const result = TraceEvent.safeParse(safeJSONParse(data));

  if (!result.success) {
    return null;
  }

  return result.data;
};
