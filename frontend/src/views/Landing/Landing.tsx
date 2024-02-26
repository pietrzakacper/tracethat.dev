import history from "history/browser";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button/button";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input/input";
import { getRandomId } from "@/utils/getRandomId";

export const Landing = () => {
  const randomToken = useMemo(() => getRandomId(), []);
  const [customToken, setCustomToken] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customToken) {
      return;
    }

    history.push({ pathname: "/", search: `?token=${customToken}` });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <header className="flex flex-col mb-16">
        <div>
          <h1 className="text-[4rem] text-foreground font-bold text-center">traceThat(…)</h1>
        </div>
        <div>
          <h2 className="text-[2rem] text-muted-foreground font-light">no-setup observability for any app</h2>
        </div>
      </header>
      <main className="flex flex-row items-center justify-center space-x-4">
        <section className="flex flex-col items-center justify-center space-y-4">
          <Button asChild size="lgWide">
            <Link to={{ pathname: "/", search: `?token=${randomToken}` }}>Start New Session</Link>
          </Button>
        </section>
        <span className="text-muted-foreground">OR</span>
        <section className="flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-sm space-y-2">
            <form className="flex space-x-2" onSubmit={onSubmit}>
              <Input
                size="lg"
                name="token"
                placeholder="Enter session ID"
                value={customToken}
                onChange={(event) => setCustomToken(event.target.value)}
              />
              <Button variant="ghost" size="lg" type="submit" disabled={!customToken}>
                Go
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};
