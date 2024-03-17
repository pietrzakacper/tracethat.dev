import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "./ui/theme-provider";
import { useMemo } from "react";

interface HighlightedCodeProps {
  code: string;
  language: string;
  className?: string;
}
export const HighlightedCode = ({ code, language, className: externalClassName }: HighlightedCodeProps) => {
  const theme = useTheme();
  const highlightTheme = useMemo(() => (theme.theme === "light" ? themes.oneLight : themes.oneDark), [theme.theme]);

  return (
    <Highlight theme={highlightTheme} code={code} language={language}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(
            className,
            "font-mono text-left py-5 px-6 rounded-sm bg-muted text-foreground select-text overflow-auto",
            externalClassName,
          )}
        >
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
