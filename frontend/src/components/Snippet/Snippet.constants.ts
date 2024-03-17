import jsLogo from "@/assets/logos/js.png";
import goLogo from "@/assets/logos/go.png";

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

const getGoBlock = (token: string) =>
  `
package main

import (
  "fmt"
  "math/rand"
  "os"
  "time"

  "github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"
)

func iter() {
  finish := tt.LogWithTime("iter")
  defer finish()

  time.Sleep(500 * time.Millisecond)

  tt.Log(fmt.Sprintf("event-%d", rand.Int()), map[string]any{
    "hello":     "world",
    "some-data": 123,
  })
}

func main() {
  tt.RegisterToken("${token}")

  for {
    iter()
  }
}
`.trim();

const CODE_BLOCKS = {
  js: getJavaScriptBlock,
  ts: getTypeScriptBlock,
  python: getPythonBlock,
  go: getGoBlock,
};
export type AvailableLanguage = keyof typeof CODE_BLOCKS;
interface LanguageDisplayData {
  name: string;
  logo: string;
}
const DISPLAY_DATA: Record<AvailableLanguage, LanguageDisplayData> = {
  js: { name: "JavaScript", logo: jsLogo },
  ts: { name: "TypeScript", logo: jsLogo },
  python: { name: "Python", logo: jsLogo },
  go: { name: "Go", logo: goLogo },
};

export const getSnippet = (language: AvailableLanguage, token: string) => CODE_BLOCKS[language](token);
export const SHOWN_LANGUAGES: AvailableLanguage[] = ["js", "go"];
export const getDisplayData = (language: AvailableLanguage) => DISPLAY_DATA[language];
