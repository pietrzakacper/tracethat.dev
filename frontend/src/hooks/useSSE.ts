import { ENDPOINTS } from "@/lib/endpoints";
import { decrypt, sha256 } from "@/utils/crypto";
import { useEffect, useState } from "react";
import { safeJSONParse } from "@/utils/safeJSONParse";

class RobustEventSource {
  private static IDLE_TIMEOUT_MS = 30 * 1000;

  private eventSource!: EventSource;
  private idleTimeout: Timer | null = null;
  private onMessageCb: ((event: MessageEvent) => void) | null = null;

  constructor(private url: string) {
    this.init();
  }

  private init(waitMs: number = 100) {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onerror = () => {
      this.cleanup();
      setTimeout(() => this.init(Math.min(waitMs * 2, 10 * 1000)), waitMs);
    };

    const scheduleCleanup = () => {
      this.idleTimeout && clearTimeout(this.idleTimeout);
      this.idleTimeout = setTimeout(() => {
        this.cleanup();
        this.init();
      }, RobustEventSource.IDLE_TIMEOUT_MS);
    };

    scheduleCleanup();

    this.eventSource.onmessage = (...args) => {
      // if the time elapsed from last message is longer than 30 seconds, close the connection and reopen it
      scheduleCleanup();

      this.onMessageCb?.(...args);
    };
  }

  onMessage(callback: (event: MessageEvent) => void) {
    this.onMessageCb = callback;
  }

  cleanup() {
    this.eventSource.onerror = () => {};
    this.eventSource.onmessage = () => {};
    this.eventSource.close();
    this.idleTimeout && clearTimeout(this.idleTimeout);
  }
}

export const useSSE = <T>(token: string, sessionId: string, parseData: (event: unknown) => T | null) => {
  const [data, setData] = useState<T[]>([]);
  const [eventSource, setEventSource] = useState<RobustEventSource | null>(null);

  useEffect(() => {
    let source: RobustEventSource | null = null;
    let cancelled = false;
    sha256(token).then((roomId) => {
      if (cancelled) return;
      const url = ENDPOINTS.events({ roomId, sessionId });
      source = new RobustEventSource(url);
      setEventSource(source);
    });

    return () => {
      cancelled = true;
      source?.cleanup();
    };
  }, [token, sessionId]);

  useEffect(() => {
    if (eventSource === null) {
      return;
    }

    let cancelled = false;
    const onMessage = async (event: MessageEvent) => {
      let decryptedData = safeJSONParse(event.data);
      let parsedData: T | null = null;
      // if decrypted data got JSON.parsed, try to parse it
      if (decryptedData !== null) {
        parsedData = parseData(decryptedData);
        if (parsedData === null) return;
        return setData((prevData) => [...prevData, parsedData!]);
      }

      // if we failed to JSON.parse it, it's probably encrypted
      decryptedData = await decrypt(event.data, token);
      if (cancelled) return;

      parsedData = parseData(safeJSONParse(decryptedData));
      if (parsedData === null) return;

      setData((prevData) => [...prevData, parsedData!]);
    };

    eventSource.onMessage(onMessage);

    return () => {
      cancelled = true;
    };
  }, [eventSource, parseData, token]);

  return { data };
};
