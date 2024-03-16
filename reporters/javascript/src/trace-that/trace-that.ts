import { serializeError } from "../serialize-error";
import { sleep, generateId } from "../utils";
import { Reporter } from "../reporter/interface";
import { runtimeConfig } from "../runtime-config";

export class FunctionTracer {
  constructor(private reporter: Reporter) {}

  traceThat<Args extends any[], Return extends any>(cb: (...args: Args) => Return): (...args: Args) => Return;

  traceThat<Args extends any[], Return extends any>(
    customName: string,
    cb: (...args: Args) => Return,
  ): (...args: Args) => Return;

  traceThat<Args extends any[], Return extends any>(
    cb: ((...args: Args) => Return) | string,
    namedCb?: (...args: Args) => Return,
  ): (...args: Args) => Return {
    const fn = typeof cb === "string" ? namedCb! : cb;
    const functionName = typeof cb === "string" ? cb : cb.name || "(anonymous)";

    return (...args: Args): Return => {
      if (!runtimeConfig.enabled) {
        return fn(...args);
      }

      const callId = generateId();
      const callStack = new Error().stack
        ?.replaceAll("\n", "")
        .split("at ")
        ?.map((s) => s.trim())
        ?.slice(2);

      const startTs = new Date().getTime();

      this.reporter.registerEvent({
        status: "running",
        callId,
        name: functionName,
        startEpochMs: startTs,
        details: {
          arguments: args,
          callStack,
        },
      });

      const registerError = (e: any) => {
        const endTs = new Date().getTime();

        this.reporter.registerEvent({
          status: "error",
          callId,
          name: functionName,
          startEpochMs: startTs,
          endEpochMs: endTs,
          details: {
            arguments: args,
            error: serializeError(e),
            callStack,
          },
        });
      };

      let returned: Return;
      try {
        returned = fn(...args);
      } catch (e) {
        registerError(e);

        throw e;
      }

      const registerSuccess = (output: Return): Return => {
        const endTs = new Date().getTime();

        this.reporter
          .registerEvent({
            status: "ok",
            callId,
            name: functionName,
            startEpochMs: startTs,
            endEpochMs: endTs,
            details: {
              callStack,
              arguments: args,
              return: output,
            },
          })
          .catch((e) => {
            console.error(`traceThat: Couldn't connect to tracethat.dev server`);
            console.error(e);
          });

        return output;
      };

      if (returned instanceof Promise) {
        return returned.then(registerSuccess).catch((e) => {
          registerError(e);
          return sleep(100).then(() => Promise.reject(e));
        }) as Return;
      } else {
        registerSuccess(returned);
        return returned;
      }
    };
  }
}
