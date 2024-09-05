import { Button } from "@/components/ui/button/button";
import { useCallback, useMemo, useState } from "react";
import { Input } from "@/components/ui/input/input";
import { getRandomId } from "@/utils/getRandomId";
import { Header } from "@/components/Header";
import { LANDING_TOKEN, SERVER_URL } from "@/lib/constants";
import { useEventsList } from "@/hooks/useEventsList";
import { EventsList } from "@/layouts/EventsList/EventsList";
import { useToken } from "@/hooks/useToken";
import history from "history/browser";
import { registerToken, setServerUrl, traceThat } from "tracethat.dev";

setServerUrl(SERVER_URL.replace("http", "ws"));
registerToken("tracethat-client");
traceThat("launch", (_: any) => {})({ lang: window.navigator.language, device: window.navigator.userAgent });

export const Landing = () => {
  const randomToken = useMemo(() => getRandomId(), []);
  const [customToken, setCustomToken] = useState("");
  const [, setToken] = useToken();
  const { data } = useEventsList(LANDING_TOKEN);

  const [selectedEventCallId, setSelectedEventCallId] = useState<string | null>(null);
  const onEventClose = useCallback(() => {
    setSelectedEventCallId(null);
  }, [setSelectedEventCallId]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToEvents(customToken);
  };

  const goToEvents = (token: string) => {
    if (!token) {
      return;
    }

    traceThat("goToEvents", () => {})();

    history.push("/events");
    setToken(token);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 viewer-2-cols:grid-cols-[minmax(800px,_1fr)_2fr] grid-rows-layout">
      <Header />
      <div className="border-r min-h-0 hidden viewer-2-cols:block">
        <EventsList
          data={data}
          selectedEventCallId={selectedEventCallId}
          onEventClose={onEventClose}
          setSelectedEventCallId={setSelectedEventCallId}
        />
      </div>
      <div className="min-h-0 min-w-0">
        <div className="p-8 flex flex-col h-full w-full overflow-auto">
          <div className="flex-grow" />
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 w-full">
              <header className="flex flex-col">
                <div>
                  <h1 className="text-[4rem] text-foreground font-bold text-center">traceThat(…)</h1>
                </div>
                <div>
                  <h2 className="text-[2rem] text-muted-foreground font-light text-center">
                    no-setup remote debugging for any app
                  </h2>
                </div>
              </header>
              <main className="flex flex-row items-center justify-center space-x-4 w-full">
                <section className="flex flex-1 items-center justify-end space-y-4">
                  <Button asChild onClick={() => goToEvents(randomToken)}>
                    <a>Start New Session</a>
                  </Button>
                </section>
                <span className="text-muted-foreground">or</span>
                <section className="flex flex-1 items-center justify-start space-y-4">
                  <form className="flex space-x-2 w-full" onSubmit={onSubmit}>
                    <Input
                      size="lg"
                      name="token"
                      placeholder="Enter session ID"
                      value={customToken}
                      onChange={(event) => setCustomToken(event.target.value)}
                      className="max-w-56"
                    />
                    <Button variant="outline" size="lg" type="submit" disabled={!customToken}>
                      Go
                    </Button>
                  </form>
                </section>
              </main>
            </div>
          </div>
          <div className="flex-grow" />
        </div>
      </div>
    </div>
  );
};
