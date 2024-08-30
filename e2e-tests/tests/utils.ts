import path from "path";
import { Readable } from "stream";
import freeports from "find-free-ports";
import { ChildProcess, exec } from "child_process";

export const rootDir = path.resolve(__dirname, "../../");

export function waitForString(str: string, stream: Readable): Promise<void> {
  const stringFoundPromise = new Promise<void>((resolve) => {
    let out = "";
    const fn = (chunk: any) => {
      out += chunk;
      if (out.includes(str)) {
        stream.off("data", fn);
        resolve();
      }
    };
    stream.on("data", fn);
  });

  return Promise.race([
    stringFoundPromise,
    sleep(5000).then(() => Promise.reject(`Timeout waiting for string "${str}"`)),
  ]);
}

export async function runServer(startPort: number): Promise<[ChildProcess, number]> {
  const [serverPort] = await freeports(1, { startPort });

  if (process.env["DEBUG"]) {
    console.log(
      `Starting server on port using command "PORT=${serverPort.toString()} LOCAL="true" DISABLE_METRICS="true" go run ./..." in ${rootDir}`,
    );
  }
  const serverProcess = exec("go run ./...", {
    env: { ...process.env, PORT: serverPort.toString(), LOCAL: "true", DISABLE_METRICS: "true" },
    cwd: rootDir,
  });
  serverProcess.stderr?.pipe(process.stderr);

  await waitForString("Listening", serverProcess.stdout!);

  return [serverProcess, serverPort];
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
