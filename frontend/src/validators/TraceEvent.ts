import { z } from "zod";

export const TraceEvent = z.object({
  name: z.string(),
  status: z.union([z.literal("ok"), z.literal("error"), z.literal("running")]),
  callId: z.string(),
  startEpochMs: z.number(),
  endEpochMs: z
    .number()
    .optional()
    .transform((v) => (v === 0 ? undefined : v)),
  details: z.any(),
  rank: z.number().optional(),
});
export type TraceEvent = z.infer<typeof TraceEvent>;

export const parseTraceEvent = (data: unknown): TraceEvent | null => {
  const result = TraceEvent.safeParse(data);

  if (!result.success) {
    console.info(result.error);
    return null;
  }

  return result.data;
};
