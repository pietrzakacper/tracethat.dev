import { StringParam, useSearchParam } from "@/hooks/useSearchParam";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { useMemo } from "react";

export const Snippet = () => {
  const [token] = useSearchParam("token", StringParam);
  const code = useMemo(() => getCodeBlock(token), [token]);

  return (
    <Highlight theme={themes.oneDark} code={code} language="ts">
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

const getCodeBlock = (token: string) =>
  `
import { traceThat, registerToken } from "tracethat.dev";

registerToken("${token}")

const hello = (name) => {
  return \`Hello ${name}!\`;
}

traceThat(hello)("world");
`.trim();
