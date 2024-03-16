import WebSocket from "isomorphic-ws";
import { runtimeConfig } from "../runtime-config";
import { Reporter } from "./interface";
import { sleep, stringify } from "../utils";
import { encrypt, sha256 } from "../crypto";

async function sendRegisterEventMessage(ws: WebSocket, payload: any) {
  const msg = await encrypt(stringify(payload), runtimeConfig.token!);

  ws.send(msg);
}

class WebSocketReporter implements Reporter {
  private ws: WebSocket | null = null;
  private connectedPromise: Promise<void> | null;

  async open(): Promise<void> {
    if (this.connectedPromise && this.ws?.readyState !== WebSocket.CLOSED) {
      return this.connectedPromise!;
    }

    this.connectedPromise = (async (): Promise<void> => {
      if (!runtimeConfig.token) {
        await sleep(100);
      }

      if (!runtimeConfig.token) {
        console.error("[tracethat.dev] Couldn't open a socket, no token provided");
        return;
      }
      const roomId = await sha256(runtimeConfig.token);

      return new Promise<void>((res, rej) => {
        this.ws = new WebSocket(`${runtimeConfig.serverUrl}?roomId=${roomId}`);

        this.ws.onopen = function open() {
          // The WebSocket type doesn't expose this property, but every Socket has it
          // we need to unref it so that it doesn't stop the Node.JS process from exiting
          // @ts-ignore
          this._socket?.unref();

          res();
        };
        this.ws.onerror = rej;
      });
    })();

    return this.connectedPromise;
  }

  async registerEvent(payload: any) {
    await this.open();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("Couldn't open a socket, failed to send an event");
      return;
    }

    sendRegisterEventMessage(this.ws, payload);
  }
}

export const reporter = new WebSocketReporter();
