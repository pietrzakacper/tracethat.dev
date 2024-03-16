import { ENDPOINTS } from "@/lib/endpoints";
import { decrypt, sha256 } from "@/utils/crypto";
import { useEffect, useState } from "react";
import { safeJSONParse } from "@/utils/safeJSONParse";


export const useSSE = <T>(
  token: string,
  sessionId: string,
  parseData: (event: unknown) => T | null,
  onError?: (error: unknown) => void,
) => {
  const [data, setData] = useState<T[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    let source: EventSource | null = null;
    let cancelled = false;
    sha256(token).then((roomId) => {
      if (cancelled) return;
      const url = ENDPOINTS.events({ roomId, sessionId });
      source = new EventSource(url);
      setEventSource(source);
    });

    return () => {
      cancelled = true;
      source?.close();
    };
  }, [token, sessionId]);

  useEffect(() => {
    if (eventSource === null) {
      return;
    }

    let cancelled = false;
    const onMessage = async (event: MessageEvent) => {
      let decryptedData = safeJSONParse(event.data)
      let parsedData: T | null = null
      // if decrypted data got JSON.parsed, try to parse it
      if (decryptedData !== null) {
        parsedData = parseData(decryptedData);
        if (parsedData === null) return
        return setData((prevData) => [...prevData, parsedData!]);
      }

      // if we failed to JSON.parse it, it's probably encrypted
      decryptedData = await decrypt(event.data, token)
      if (cancelled) return

      parsedData = parseData(safeJSONParse(decryptedData));
      if (parsedData === null) return

      setData((prevData) => [...prevData, parsedData!]);
    };

    eventSource.addEventListener("message", onMessage);

    return () => {
      cancelled = true;
      eventSource.removeEventListener("message", onMessage);
    };
  }, [eventSource, parseData, token]);

  useEffect(() => {
    if (eventSource === null || onError == null) {
      return;
    }

    eventSource.addEventListener("error", onError);

    return () => eventSource.removeEventListener("error", onError);
  }, [eventSource, onError]);

  return { data };
};
