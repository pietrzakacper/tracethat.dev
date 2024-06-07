import { SERVER_URL } from "@/lib/constants";
import { getRandomIntInRange } from "@/utils/getRandomIntInRange";
import { wait } from "@/utils/wait";
import { useCallback } from "react";
import { setServerUrl, registerToken, traceThat } from "tracethat.dev";

interface UseExampleTracerArguments {
  token: string | null;
  eventName?: string;
}

export const useExampleTracer = ({ token, eventName = "onTraceClick" }: UseExampleTracerArguments) => {
  const onTraceClickInternal = useCallback(
    (e: React.MouseEvent) => {
      if (token == null) {
        return null;
      }

      setServerUrl(SERVER_URL.replace("http", "ws"));
      registerToken(token);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      traceThat(eventName, async (event: React.MouseEvent) => {
        await wait(getRandomIntInRange(1, 10));

        return {
          x: event.clientX,
          y: event.clientY,
        };
      })(e);
    },
    [eventName, token],
  );

  const onTraceClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target && e.target instanceof Element) {
        e.target = e.target.outerHTML as unknown as Element;
      }
      if (e.currentTarget && e.currentTarget instanceof Element) {
        e.currentTarget = e.currentTarget.outerHTML as unknown as Element;
      }

      onTraceClickInternal(e);
    },
    [onTraceClickInternal],
  );

  if (token == null) {
    return null;
  }

  return onTraceClick;
};
