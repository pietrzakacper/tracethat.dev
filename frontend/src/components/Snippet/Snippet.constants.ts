import jsLogo from "@/assets/logos/js.png";
import goLogo from "@/assets/logos/go.png";
import pythonLogo from "@/assets/logos/python.png";

const getJavaScriptBlock = (token: string) =>
  `
import { traceThat, registerToken } from "tracethat.dev";

registerToken("${token}");

const hello = (name) => {
  return \`Hello \${name}!\`;
}

traceThat(hello)("world");
`.trim();

const getPythonBlock = (token: string) =>
  `
import asyncio
from tracethat import tracethat, register_token

register_token('${token}')

@tracethat
async def hello(name: str) -> str:
    await asyncio.sleep(1)
    return f'Hello, {name}!'

async def main():
  await hello(name='world')

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
  python: getPythonBlock,
  go: getGoBlock,
};
const INSTALLATION_CODE_BLOCKS = {
  js: "npm install tracethat.dev",
  python: "pip install tracethat",
  go: "go get github.com/pietrzakacper/tracethat.dev/reporters/golang/tt",
};
export type AvailableLanguage = keyof typeof CODE_BLOCKS;
interface LanguageDisplayData {
  name: string;
  logo: string;
}
const DISPLAY_DATA: Record<AvailableLanguage, LanguageDisplayData> = {
  js: { name: "JavaScript", logo: jsLogo },
  python: { name: "Python", logo: pythonLogo },
  go: { name: "Go", logo: goLogo },
};

export const getInstallationSnippet = (language: AvailableLanguage) => INSTALLATION_CODE_BLOCKS[language];
export const getSnippet = (language: AvailableLanguage, token: string) => CODE_BLOCKS[language](token);
export const SHOWN_LANGUAGES: AvailableLanguage[] = ["js", "python", "go"];
export const getDisplayData = (language: AvailableLanguage) => DISPLAY_DATA[language];
