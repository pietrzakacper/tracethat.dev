import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { useMemo, useState } from "react";
import { useTheme } from "./ui/theme-provider";

interface SnippetProps {
  token: string;
}
export const Snippet = ({ token }: SnippetProps) => {
  const [language] = useState<AvailableLanguage>("ts");
  const theme = useTheme();
  const highlightTheme = useMemo(() => (theme.theme === "light" ? themes.oneLight : themes.oneDark), [theme.theme]);
  const code = useMemo(() => CODE_BLOCKS[language](token), [language, token]);

  return (
    <Highlight theme={highlightTheme} code={code} language={language}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre className={cn(className, "font-mono text-left py-5 px-6 rounded-sm bg-muted text-foreground select-text")}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

const getJavaScriptBlock = (token: string) =>
  `
import { traceThat, registerToken } from "tracethat.dev";

registerToken("${token}");

const hello = (name) => {
  return \`Hello \${name}!\`;
}

traceThat(hello)("world");
`.trim();

const getTypeScriptBlock = (token: string) =>
  `
import { traceThat, registerToken } from "tracethat.dev";

registerToken("${token}");

const hello = (name: string) => {
  return \`Hello \${name}!\`;
}

traceThat(hello)("world");
`.trim();

const getPythonBlock = (token: string) =>
  `
from tracethat_dev import trace_that, register_token

register_token('${token}')

def hello(name):
    return f'Hello {name}!'

trace_that(hello)('world')
`.trim();

const CODE_BLOCKS = {
  js: getJavaScriptBlock,
  ts: getTypeScriptBlock,
  python: getPythonBlock,
};
type AvailableLanguage = keyof typeof CODE_BLOCKS;
// const AVAILABLE_LANGUAGES = Object.keys(CODE_BLOCKS) as AvailableLanguage[];
