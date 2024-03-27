import WebSocket from "isomorphic-ws";
import { runtimeConfig } from "../runtime-config";
import { Reporter } from "./interface";
import { sleep, stringify } from "../utils";
import { encrypt, sha256 } from "../crypto";
import { ProcessExitBlocker } from "../process-exit-blocker";

async function sendRegisterEventMessage(ws: WebSocket, payload: any) {
  const msg = await encrypt(stringify(payload), runtimeConfig.token!);
  ws.send(msg)
}

const INACTIVITY_TIMEOUT_MS = 30 * 1000;

class WebSocketReporter implements Reporter {
  private ws: Promise<WebSocket> | null = null;
  private cleanupTimeoutRef: NodeJS.Timeout | null = null;

  constructor() {
    ProcessExitBlocker.instance.onShouldExit(() => {
      this.cleanup()
    })
  }

  private async open(): Promise<WebSocket> {
    if (this.ws) {
      return this.ws;
    }

    if (!runtimeConfig.token) {
      await sleep(100);
    }

    if (!runtimeConfig.token) {
      console.error("[tracethat.dev] Couldn't open a socket, no token provided");
      return Promise.reject("No token provided");
    }

    const roomId = await sha256(runtimeConfig.token);
    const ws = new WebSocket(`${runtimeConfig.serverUrl}/api/report?roomId=${roomId}`);

    return this.ws = new Promise((resolve, reject) => {
      ws.onopen = function() {
        // The WebSocket type doesn't expose this property, but every Socket has it
        // we need to unref it so that it doesn't stop the Node.JS process from exiting
        this._socket?.unref()
        resolve(ws);
      };

      ws.onerror = (err) => {
        ws.close()
        this.ws = null;
        reject(err);
      }
    })
  }

  private async cleanup() {
    this.cleanupTimeoutRef && clearTimeout(this.cleanupTimeoutRef);

    if(this.ws) {
      return this.ws.then(ws => {
        ws.close();
        this.ws = null
      });
    }
  }

  private scheduleCleanup() {
    this.cleanupTimeoutRef && clearTimeout(this.cleanupTimeoutRef);
    this.cleanupTimeoutRef = setTimeout(() => { 
      this.cleanup()
    }, INACTIVITY_TIMEOUT_MS)
  }

  async registerEvent(payload: any) {
    const impl = async () => {
      try {
        const ws = await this.open();
  
        if (ws.readyState !== WebSocket.OPEN) {
          throw new Error("Socked closed, failed to send an event");
        }
  
        await sendRegisterEventMessage(ws, payload);

        this.scheduleCleanup();
      } catch(e) {
        await this.cleanup();
        throw e;
      }
    }

    try {
      await impl()
      return
    } catch (e) {
      // first one failed, try again
    }
  
    try {
      await impl()
    } catch(e) {
      // not much a user can do here
      console.error(e)
    }
  }
}

export const reporter = new WebSocketReporter();
