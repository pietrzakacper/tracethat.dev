import { useEffect, useState } from "react";

export const useSSE = <T>(
  url: string | undefined,
  parseData: (event: unknown) => T | null,
  onError?: (error: unknown) => void,
) => {
  const [data, setData] = useState<T[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    if (url === undefined) {
      return;
    }

    const source = new EventSource(url);
    setEventSource(source);

    return () => source.close();
  }, [url]);

  useEffect(() => {
    if (eventSource === null) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const parsedData = parseData(event.data);
      if (parsedData !== null) {
        setData((prevData) => [...prevData, parsedData]);
      }
    };

    eventSource.addEventListener("message", onMessage);

    return () => eventSource.removeEventListener("message", onMessage);
  }, [eventSource, parseData]);

  useEffect(() => {
    if (eventSource === null || onError == null) {
      return;
    }

    eventSource.addEventListener("error", onError);

    return () => eventSource.removeEventListener("error", onError);
  }, [eventSource, onError]);

  return { data };
};
