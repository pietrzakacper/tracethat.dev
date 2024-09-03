import test from "tape";
import { traceThat, registerToken, setServerUrl } from "tracethat.dev";
import { WebSocketServer, RawData } from "ws";
import freeports from "find-free-ports";
import { sleep } from "../src/utils";
import { decrypt } from "../src/crypto";

console.log("Running integration tests with node " + process.version);

async function waitFor(msg: string, condition: () => boolean, timeoutMs = 1000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for: " + msg);
    }
    await sleep(0);
  }
}

async function runWsServer(startPort: number) {
  const [serverPort] = await freeports(1, { startPort });
  const wss = new WebSocketServer({ port: serverPort });

  const state = {
    messages: [] as RawData[],
  };

  wss.on("connection", function connection(ws) {
    ws.on("message", function message(data) {
      state.messages.push(data);
    });

    ws.send("something");
  });

  return {
    port: serverPort,
    state,
    stop: () => wss.close(),
  };
}

test("traceThat: reports arguments and return value of a synchronous fn", async (t) => {
  const server = await runWsServer(4000);

  const token = "test-token";
  registerToken(token);
  setServerUrl(`ws://localhost:${server.port}`);

  const tracedFunction = traceThat((a, b) => a + b + 1);

  const result = tracedFunction(1, 1);

  t.equals(result, 3);

  await waitFor("messages to be received", () => server.state.messages.length >= 2);

  t.equals(server.state.messages.length, 2, 'Contains both "running" and "ok" messages');

  const decryptedMessages = await Promise.all(
    server.state.messages.map((msg) => decrypt(msg.toString("utf-8"), token).then(JSON.parse)),
  );

  const okMsg = decryptedMessages.find((msg) => msg.status === "ok")!;

  t.equal(okMsg.name, "(anonymous)");
  t.deepEqual(okMsg.details.arguments, [1, 1]);
  t.equal(okMsg.details.return, 3);

  t.end();
  server.stop();
});
