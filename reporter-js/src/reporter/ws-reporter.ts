import WebSocket from "isomorphic-ws";
import { runtimeConfig } from "../runtime-config";
import { Reporter } from './interface'

function sendRegisterEventMessage(
  ws: WebSocket,
  payload: any
) {
  const msg = JSON.stringify(payload)

  ws.send(msg);
}

class WebSocketReporter implements Reporter {
  private ws: WebSocket | null = null;
  private connectedPromise: Promise<void> | null;

  async open(): Promise<void> {
    if (!runtimeConfig.token) {
      await new Promise(res => setTimeout(res, 100))
    }

    if (!runtimeConfig.token) {
      console.error("[tracethat.dev] Couldn't open a socket, no token provided");
      return;
    }

    const token = runtimeConfig.token

    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return this.connectedPromise!;
    }

    this.connectedPromise = new Promise((res, rej) => {
      this.ws = new WebSocket(`${runtimeConfig.serverUrl}?token=${token}`);

      this.ws.onopen = function open() {
        // The WebSocket type doesn't expose this property, but every Socket has it
        // we need to unref it so that it doesn't stop the Node.JS process from exiting 
        // @ts-ignore
        this._socket?.unref()

        res();
      };
      this.ws.onerror = rej;
    });

    return this.connectedPromise
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

