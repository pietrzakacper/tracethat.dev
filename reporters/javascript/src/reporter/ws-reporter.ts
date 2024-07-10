import WebSocket from "isomorphic-ws";
import { onConfigChange, runtimeConfig } from "../runtime-config";
import { Reporter } from "./interface";
import { sleep, stringify } from "../utils";
import { encrypt, sha256 } from "../crypto";
import { ProcessExitBlocker } from "../process-exit-blocker";
import { log } from "../logger";

async function sendRegisterEventMessage(ws: WebSocket, payload: any) {
  const msg = await encrypt(stringify(payload), runtimeConfig.token!);
  
  return new Promise((res, rej) => {
    ws.send(msg, (err) => {
      if (err) {
        rej(err);
      } else {
        res(undefined);
      }
    });
  })
}

const INACTIVITY_TIMEOUT_MS = 30 * 1000;
const MAX_PARALLEL_CALLS = 10;

class WebSocketReporter implements Reporter {
  private ws: Promise<WebSocket> | null = null;
  private cleanupTimeoutRef: NodeJS.Timeout | null = null;
  private parellelCalls = 0;

  constructor() {
    ProcessExitBlocker.instance.onShouldExit(() => {
      this.cleanup(true);
    });

    onConfigChange(() => {
      log("Config changed")
      this.cleanup();
    });
  }

  private async open(): Promise<WebSocket> {
    const callId = `[${Math.random().toString(36).substring(7)}] `;
    log(callId + "open() called ")

    if (this.ws) {
      log(callId + "returned existing ws")
      return this.ws;
    }

    if (!runtimeConfig.token) {
      log(callId + "sleeping for token")
      await sleep(100);
    }

    if (!runtimeConfig.token) {
      log(callId + "did not find token, rejecting")

      console.error("[tracethat.dev] Couldn't open a socket, no token provided");
      return Promise.reject("No token provided");
    }

    log(callId + "creating new connection with token: " + runtimeConfig.token)

    return (this.ws = sha256(runtimeConfig.token).then(roomId => new Promise((resolve, reject) => {
      let url = `${runtimeConfig.serverUrl}/api/report?roomId=${roomId}`
      if(runtimeConfig.debug) {
        url += `&debugToken=${runtimeConfig.token}`
      }

      const ws = new WebSocket(url);
      ws.onopen = function () {
        // The WebSocket type doesn't expose this property, but every Socket has it
        // we need to unref it so that it doesn't stop the Node.JS process from exiting
        this._socket?.unref();
        resolve(ws);
      };

      ws.onerror = (err) => {
        ws.close();
        this.ws = null;
        reject(err);
      };
    })))
  }

  private async cleanup(force = false) {
    this.cleanupTimeoutRef && clearTimeout(this.cleanupTimeoutRef);
    if (this.ws) {
      return this.ws.then((ws) => {
        ws.close();
        force && ws.terminate?.();
        this.ws = null;
        this.parellelCalls = 0;
      });
    }
  }

  private scheduleCleanup() {
    this.cleanupTimeoutRef && clearTimeout(this.cleanupTimeoutRef);
    this.cleanupTimeoutRef = setTimeout(() => {
      this.cleanup();
    }, INACTIVITY_TIMEOUT_MS);
  }

  async registerEvent(payload: any) {
    const impl = async () => {
      while (this.parellelCalls >= MAX_PARALLEL_CALLS) {
        log(`[${payload.callId}] waiting for parellel calls to go down`)
        await sleep(10);
      }
      this.parellelCalls++;

      try {
        const ws = await this.open();

        if (ws.readyState !== WebSocket.OPEN) {
          throw new Error("Socked closed, failed to send an event");
        }

        await sendRegisterEventMessage(ws, payload);

        this.scheduleCleanup();
      } catch (e) {
        await this.cleanup();
        throw e;
      } finally {
        this.parellelCalls--;
      }
    };

    try {
      await impl();
      return;
    } catch (e) {
      // first one failed, try again
    }

    try {
      await impl();
    } catch (e) {
      // not much a user can do here
      console.error(e);
    }
  }
}

export const reporter = new WebSocketReporter();
