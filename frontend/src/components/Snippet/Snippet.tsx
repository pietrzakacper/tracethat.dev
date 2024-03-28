import { useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { AvailableLanguage, SHOWN_LANGUAGES, getDisplayData, getSnippet } from "./Snippet.constants";
import { Button } from "../ui/button/button";
import { ChevronDown } from "lucide-react";
import { HighlightedCode } from "../HighlightedCode";

interface SnippetProps {
  token: string;
}
export const Snippet = ({ token }: SnippetProps) => {
  const [language, setLanguage] = useState<AvailableLanguage>("js");
  const code = useMemo(() => getSnippet(language, token), [language, token]);

  const selectedButton = useMemo(() => {
    const { logo, name } = getDisplayData(language);
    return (
      <Button variant="outline" size="sm" className="px-1">
        <div className="relative">
          <img src={logo} alt={name} className="h-5 aspect-square rounded-tiny" />
          <div className="fill-absolute ring-1 ring-primary/10 ring-inset rounded-tiny" />
        </div>
        <ChevronDown className="ml-1 h-4 w-4" />
      </Button>
    );
  }, [language]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{selectedButton}</DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SHOWN_LANGUAGES.map((lang) => {
              const { logo, name } = getDisplayData(lang);

              return (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}>
                  <div className="relative">
                    <img src={logo} alt={name} className="w-6 aspect-square rounded-tiny" />
                    <div className="fill-absolute ring-1 ring-primary/10 ring-inset rounded-tiny" />
                  </div>
                  <span className="ml-2">{name}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <HighlightedCode code={code} language={language} />
    </div>
  );
};
