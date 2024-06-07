import { serializeError } from "../serialize-error";
import { sleep, generateId } from "../utils";
import { Reporter } from "../reporter/interface";
import { runtimeConfig } from "../runtime-config";
import { ProcessExitBlocker } from "../process-exit-blocker";
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

      const exitBlocker = ProcessExitBlocker.instance;

      exitBlocker.addPending(1);

      const callId = generateId();
      const callStack = new Error().stack
        ?.replaceAll("\n", "")
        .split("at ")
        ?.map((s) => s.trim())
        ?.slice(2);

      const startTs = new Date().getTime();

      this.reporter
        .registerEvent({
          status: "running",
          callId,
          name: functionName,
          startEpochMs: startTs,
          details: {
            arguments: args,
            callStack,
          },
        })
        .finally(() => {
          exitBlocker.resolvePending();
        });

      const registerError = (e: any) => {
        const endTs = new Date().getTime();

        return this.reporter
          .registerEvent({
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
          })
          .finally(() => {
            exitBlocker.resolvePending();
          });
      };

      let returned: Return;
      try {
        returned = fn(...args);
        exitBlocker.addPending(1);
      } catch (e) {
        setTimeout(() => registerError(e), 0);

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
          .finally(() => {
            exitBlocker.resolvePending();
          });

        return output;
      };

      if (returned instanceof Promise) {
        return (
          returned
            .then(registerSuccess)
            // wait at most a second to send the error
            .catch((e) => Promise.race([registerError(e), sleep(1000)]).then(() => Promise.reject(e))) as Return
        );
      } else {
        // if it's run synchronously it prevents process from exiting but only for Bun :(
        setTimeout(() => registerSuccess(returned), 0);
        return returned;
      }
    };
  }
}
