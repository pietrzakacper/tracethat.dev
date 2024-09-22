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
import asyncio
from tracethat import tracethat

tracethat.register_token('${token}')

@tracethat
async def hello(name: str) -> str:
    await asyncio.sleep(1)
    return f'Hello, {name}!'

async def main():
    await hello(name='Kacper')

asyncio.run(main())
`.trim();

const getGoBlock = (token: string) =>
  `
package main

import (
  "time"

  "github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"
)

func hello(name string) {
  defer tt.LogWithTime("hello", name)()
  time.Sleep(time.Second)
}

func main() {
  tt.Config.RegisterToken("${token}")
  
  hello("world")
  
  tt.Wait()
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
