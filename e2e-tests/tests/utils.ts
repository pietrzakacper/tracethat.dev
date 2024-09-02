import path from "path";
import { PassThrough, Readable } from "stream";
import freeports from "find-free-ports";
import { ChildProcess, exec } from "child_process";

export const rootDir = path.resolve(__dirname, "../../");

export function waitForString(str: string, stream: Readable, timeoutMs = 20000): Promise<void> {
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
    sleep(timeoutMs).then(() => Promise.reject(`Timeout waiting for string "${str}"`)),
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

  const out = new PassThrough();
  serverProcess.stdout?.pipe(out);
  serverProcess.stdout?.pipe(process.stdout);
  serverProcess.stderr?.pipe(process.stderr);

  await waitForString("Listening", out);

  if (process.env["DEBUG"]) {
    console.log(`Server started on port ${serverPort}`);
  }

  return [serverProcess, serverPort];
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
