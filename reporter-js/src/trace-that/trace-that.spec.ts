import test from "tape";
import { Reporter } from "../reporter/interface";
import { sleep } from "../utils";
import { FunctionTracer } from "./trace-that";

class MockReporter implements Reporter {
  public calls: [string, any][] = [];

  open() {
    this.calls.push(["open", undefined]);
    return Promise.resolve();
  }

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

  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === 'ok'
  )!;

  t.equal(registerEventPayload.name, "(anonymous)");
  t.deepEqual(registerEventPayload.arguments, [1, 1]);
  t.equal(registerEventPayload.return, 3);

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

  await sleep(100);

  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === 'ok'
  )!;

  t.equal(registerEventPayload.name, "(anonymous)");
  t.deepEqual(registerEventPayload.arguments, [1, 1]);
  t.equal(registerEventPayload.return, 3);

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
  } catch { }

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === 'error'
  )!;

  t.equal(registerEventPayload.name, "(anonymous) (crashed)");
  t.deepEqual(registerEventPayload.arguments, [1]);
  t.equal(typeof registerEventPayload.error, 'object')
  t.equal(registerEventPayload.error.message, 'Crashed on 1')

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
  } catch { }

  const registerEventSpy = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === 'error'
  )!;

  t.ok(registerEventSpy)

  t.equal(registerEventSpy[1].name, "(anonymous) (crashed)");
  t.deepEqual(registerEventSpy[1].arguments, [1]);
  t.equal(typeof registerEventSpy[1].error, 'object')
  t.equal(registerEventSpy[1].error.message, 'Crashed on 1')

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

  await sleep(100);

  t.equals(result, 3);

  const [, registerEventPayload] = mockReporter.calls.find(
    ([fn, payload]) => fn === "registerEvent" && payload?.status === 'running'
  )!;

  t.equal(registerEventPayload.name, "(anonymous) (running)");
  t.deepEqual(registerEventPayload.arguments, [1, 1]);

  t.end();
});