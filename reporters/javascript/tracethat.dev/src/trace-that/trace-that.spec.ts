import test from "tape";
import { Reporter } from "../reporter/interface";
import { sleep } from "../utils";
import { FunctionTracer, waitForFlush } from "./trace-that";

class MockReporter implements Reporter {
  public calls: [string, any][] = [];

  registerEvent(payload: any) {
    this.calls.push(["registerEvent", payload]);
    return Promise.resolve();
  }
}

test("traceThat: reports arguments and return value of synchronous fn", async (t) => {
  const mockReporter = new MockReporter();
  const tracer = new FunctionTracer(mockReporter);

  const tracedFunction = tracer.traceThat((a, b) => a + b + 1);

  const result = tracedFunction(1, 1);

  await waitForFlush();
  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === "ok",
  )!;

  t.equal(registerEventPayload.name, "(anonymous)");
  t.equal(registerEventPayload.details.return, 3);

  t.end();
});

test("traceThat: reports arguments and return value of async fn", async (t) => {
  const mockReporter = new MockReporter();
  const tracer = new FunctionTracer(mockReporter);

  const tracedFunction = tracer.traceThat(async (a, b) => {
    await sleep(100);
    return a + b + 1;
  });

  const result = await tracedFunction(1, 1);

  await waitForFlush();

  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === "ok",
  )!;

  t.equal(registerEventPayload.name, "(anonymous)");
  t.equal(registerEventPayload.details.return, 3);

  t.end();
});

test("traceThat: reports exception of synchronous fn", async (t) => {
  const mockReporter = new MockReporter();
  const tracer = new FunctionTracer(mockReporter);

  const tracedFunction = tracer.traceThat((a) => {
    throw new Error(`Crashed on ${a}`);
  });

  try {
    tracedFunction(1);
  } catch {}

  await waitForFlush();

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === "error",
  )!;

  t.equal(registerEventPayload.name, "(anonymous)");
  t.equal(typeof registerEventPayload.details.error, "object");
  t.equal(registerEventPayload.details.error.message, "Crashed on 1");

  t.end();
});

test("traceThat: reports exception of async fn", async (t) => {
  const mockReporter = new MockReporter();
  const tracer = new FunctionTracer(mockReporter);

  const tracedFunction = tracer.traceThat(async (a) => {
    await sleep(100);
    throw new Error(`Crashed on ${a}`);
  });

  try {
    await tracedFunction(1);
  } catch {}

  await waitForFlush();

  const registerEventSpy = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === "error",
  )!;

  t.ok(registerEventSpy);

  t.equal(registerEventSpy[1].name, "(anonymous)");
  t.equal(typeof registerEventSpy[1].details.error, "object");
  t.equal(registerEventSpy[1].details.error.message, "Crashed on 1");

  t.end();
});

test("traceThat: reports that function is running", async (t) => {
  const mockReporter = new MockReporter();
  const tracer = new FunctionTracer(mockReporter);

  const tracedFunction = tracer.traceThat(async (a, b) => {
    await sleep(100);
    return a + b + 1;
  });

  const result = await tracedFunction(1, 1);

  await waitForFlush();

  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === "running",
  )!;

  t.equal(registerEventPayload.name, "(anonymous)");
  t.deepEqual(registerEventPayload.details.arguments, [1, 1]);

  t.end();
});

test("traceThat: some callstack entry contains caller function name", async (t) => {
  const mockReporter = new MockReporter();
  const tracer = new FunctionTracer(mockReporter);

  async function hello() {
    const tracedFunction = tracer.traceThat((a, b) => sleep(1000).then(() => a + b + 1));

    const result = await tracedFunction(1, 1);
    return result;
  }

  const result = await hello();

  await waitForFlush();

  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === "running",
  )!;

  t.ok(Array.isArray(registerEventPayload.details.callStack));
  t.ok(registerEventPayload.details.callStack.some((s) => s.includes("hello")));

  t.end();
});
