import { Github, DeleteIcon } from "lucide-react";
import { Logo } from "./Logo";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button/button";
import { Link } from "./Link";

export const Header = (props: { onClear?: () => void }) => {
  return (
    <header className="col-span-full p-4 border-b flex items-center">
      <Link to={{ pathname: "/" }}>
        <Logo />
      </Link>
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
      </div>
    </header>
  );
};
