import { Github, DeleteIcon, BookCheck } from "lucide-react";
import { Logo } from "./Logo";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button/button";
import history from "history/browser";

export const Header = (props: { onClear?: () => void }) => {
  return (
    <header className="col-span-full p-4 border-b flex items-center">
      <Logo onClick={() => history.push("/")} />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {props.onClear && (
          <Button variant="outline" onClick={props.onClear}>
            Clear
            <DeleteIcon className="w-4 h-4 ml-2" />
          </Button>
        )}
        <ModeToggle />
        <Button variant="outline" asChild size="icon">
          <a href="https://github.com/pietrzakacper/tracethat.dev" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
          </a>
        </Button>
        <Button variant="outline" asChild size="icon">
          <a href="https://docs.tracethat.dev" target="_blank" rel="noopener noreferrer">
            <BookCheck className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </header>
  );
};
