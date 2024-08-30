import { expect, test } from "@playwright/test";
import { runServer } from "../utils";
import child_process from "child_process";
import util from "util";
import path from "path";

const exec = util.promisify(child_process.exec);

let serverProcess: child_process.ChildProcess;
let serverPort: number;

test("send 100 events from JS server", async ({ page }) => {
  [serverProcess, serverPort] = await runServer(3400);

  const TOKEN = "bulk-test-token";
  const TEST_NAME = "long-johnny";

  await page.goto(`http://localhost:${serverPort}`);
  await page.getByPlaceholder("Enter session ID").fill(TOKEN);
  await page.getByRole("button", { name: "Go" }).click();

  const COUNT = 100;

  await exec(`node count.js ${TEST_NAME} ${COUNT}`, {
    env: { ...process.env, TT_TOKEN: TOKEN, TT_SERVER_URL: `ws://localhost:${serverPort}` },
    cwd: path.join(__dirname, "reporter"),
  });

  for (let i = 1; i <= COUNT; i++) {
    await expect(page.getByText(`count ${i}`)).toBeDefined();
  }
});

test.afterAll(() => {
  serverProcess?.kill();
});
