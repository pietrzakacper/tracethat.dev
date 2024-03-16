import { useEffect, useMemo, useState } from "react";
import { useSSE } from "./useSSE";
import { TraceEvent, parseTraceEvent } from "@/validators/TraceEvent";

export const useEventsList = (token: string) => {
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const { data } = useSSE(token, sessionId, parseTraceEvent);
  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);

  const sortedData = useMemo(() => {
    const visitedEvents = new Set<string>();

    const sortedData = data.toSorted((a, b) => {
      const startEpochMsA = a.startEpochMs;
      const endEpochMsA = a.endEpochMs;
      const startEpochMsB = b.startEpochMs;
      const endEpochMsB = b.endEpochMs;

      const epochMsA = endEpochMsA || startEpochMsA;
      const epochMsB = endEpochMsB || startEpochMsB;

      return epochMsA - epochMsB;
    });

    const outputData: TraceEvent[] = [];
    for (let i = sortedData.length - 1; i >= 0; i--) {
      const event = sortedData[i];
      if (!visitedEvents.has(event.callId)) {
        outputData.unshift(event);
      }

      visitedEvents.add(event.callId);
    }

    return outputData;
  }, [data]);

  const firstEvent = sortedData[0];
  useEffect(() => {
    if (firstEvent != null) {
      setSelectedEventCallId(firstEvent.callId);
    }
  }, [firstEvent]);

  return {
    data: sortedData,
    selectedEventCallId,
    setSelectedEventCallId,
  };
};
