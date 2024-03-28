import path from "path";
import { Readable } from "stream";
import freeports from "find-free-ports";
import { exec } from "child_process";

export const rootDir = path.resolve(__dirname, "../../");

export function waitForString(str: string, stream: Readable): Promise<void> {
  return new Promise<void>((resolve) => {
    let out = "";
    stream.on("data", (chunk) => {
      out += chunk;
      if (out.includes(str)) {
        resolve();
      }
    });
  });
}

export async function runServer(startPort: number): Promise<number> {
  const [serverPort] = await freeports(1, { startPort });

  const serverProcess = exec("go run ./...", { env: { ...process.env, PORT: serverPort.toString() }, cwd: rootDir });

  serverProcess.stderr?.pipe(process.stderr);

  await waitForString("Listening", serverProcess.stdout!);

  return serverPort;
}
