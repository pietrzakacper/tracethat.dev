import { expect, test } from "@playwright/test";
import { runServer } from "../utils";
import child_process from "child_process";
import util from "util";
import path from "path";

const exec = util.promisify(child_process.exec);

const TOKEN = "test-token";
const TEST_NAME = "johnny";

let serverProcess: child_process.ChildProcess;

test("send hello from JS server", async ({ page }) => {
  let serverPort: number;
  [serverProcess, serverPort] = await runServer(3000);

  await page.goto(`http://localhost:${serverPort}`);
  await page.getByPlaceholder("Enter session ID").fill(TOKEN);
  await page.getByRole("button", { name: "Go" }).click();

  await exec(`node hello.js ${TEST_NAME}`, {
    env: { ...process.env, TT_TOKEN: TOKEN, TT_SERVER_URL: `ws://localhost:${serverPort}` },
    cwd: path.join(__dirname, "reporter"),
  });

  await expect(page.getByText(`hello ${TEST_NAME}`)).toBeVisible();
});

test.afterAll(() => {
  serverProcess?.kill();
});
