import { SHOWN_LANGUAGES, getDisplayData, getInstallationSnippet, getSnippet } from "./Snippet.constants";
import { HighlightedCode } from "../HighlightedCode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SnippetProps {
  token: string;
}
export const Snippet = ({ token }: SnippetProps) => {
  return (
    <Tabs defaultValue={SHOWN_LANGUAGES[0]} className="flex flex-col w-full items-end">
      <TabsList className="h-auto">
        {SHOWN_LANGUAGES.map((language) => {
          const { logo, name, addRing } = getDisplayData(language);
          return (
            <TabsTrigger key={language} value={language} className="p-2">
              <div className="relative">
                <img src={logo} alt={name} className="w-5 aspect-square rounded-tiny" />
                {addRing && <div className="fill-absolute ring-1 ring-primary/10 ring-inset rounded-tiny" />}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {SHOWN_LANGUAGES.map((language) => (
        <TabsContent key={language} value={language} className="w-full">
          <HighlightedCode language="bash" code={getInstallationSnippet(language)} />
          <br />
          <HighlightedCode language={language} code={getSnippet(language, token)} />
        </TabsContent>
      ))}
    </Tabs>
  );
};
