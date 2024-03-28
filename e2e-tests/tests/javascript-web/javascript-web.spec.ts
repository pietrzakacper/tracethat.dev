import { expect, test } from "@playwright/test";
import { runServer, waitForString } from "../utils";
import child_process from "child_process";
import path from "path";
import findFreePorts from "find-free-ports";

const TOKEN = "test-token";
const TEST_NAME = "johnny";

let clientProc: child_process.ChildProcess;

test("send hello from JS web client", async ({ page, context }) => {
  const serverPort = await runServer(3200);

  await page.goto(`http://localhost:${serverPort}`);
  await page.getByPlaceholder("Enter session ID").fill(TOKEN);
  await page.getByRole("button", { name: "Go" }).click();

  const [clientPort] = await findFreePorts(1, { startPort: 3250 });

  clientProc = child_process.exec(`npm run start -- -p ${clientPort.toString()}`, {
    cwd: path.join(__dirname, "reporter"),
  });

  await waitForString("Available on", clientProc.stdout!);

  const clientPage = await context.newPage();
  await clientPage.goto(`http://localhost:${clientPort}?token=${TOKEN}&server_port=${serverPort}&name=${TEST_NAME}`);
  await expect(clientPage.getByText("client started")).toBeVisible();

  await expect(clientPage.getByText("event sent")).toBeVisible();

  await expect(page.getByText(`hello ${TEST_NAME}`)).toBeVisible();
});

test.afterAll(() => {
  clientProc?.kill();
});
