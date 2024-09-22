import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "./ui/theme-provider";
import { useMemo, useState } from "react";
import { FiClipboard, FiCheck } from "react-icons/fi";

interface HighlightedCodeProps {
  code: string;
  language: string;
  className?: string;
}

export const HighlightedCode = ({ code, language, className: externalClassName }: HighlightedCodeProps) => {
  const theme = useTheme();
  const highlightTheme = useMemo(() => (theme.theme === "light" ? themes.oneLight : themes.oneDark), [theme.theme]);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Failed to copy!", err);
      },
    );
  };

  return (
    <Highlight theme={highlightTheme} code={code} language={language}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <div className="relative group">
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
          <button
            onClick={handleCopyClick}
            aria-label="Copy code to clipboard"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 text-gray-800 p-1 rounded"
          >
            {isCopied ? <FiCheck className="w-5 h-5" /> : <FiClipboard className="w-5 h-5" />}
          </button>
        </div>
      )}
    </Highlight>
  );
};
