import WebSocket from "isomorphic-ws";
import { runtimeConfig } from "../runtime-config";
import { Reporter } from "./interface";
import { PromiseWithResolvers, sleep, stringify } from "../utils";
import { encrypt, sha256 } from "../crypto";

async function sendRegisterEventMessage(ws: WebSocket, payload: any) {
  const msg = await encrypt(stringify(payload), runtimeConfig.token!);

  ws.send(msg);
}

class OpenedWebSocket {
  public ws: WebSocket;
  private promiseWithResolvers = new PromiseWithResolvers<void, WebSocket.ErrorEvent>();

  private constructor(public token: string, roomId: string) {
    this.promiseWithResolvers = new PromiseWithResolvers();
    const promiseWithResolvers = this.promiseWithResolvers;
    this.ws = new WebSocket(`${runtimeConfig.serverUrl}?roomId=${roomId}`);

    this.ws.onopen = function open() {
      // The WebSocket type doesn't expose this property, but every Socket has it
      // we need to unref it so that it doesn't stop the Node.JS process from exiting
      this._socket?.unref();

      promiseWithResolvers.resolve();
    };
    this.ws.onerror = promiseWithResolvers.reject;
  }

  public static async open() {
    if (!runtimeConfig.token) {
      await sleep(100);
    }

    if (!runtimeConfig.token) {
      console.error("[tracethat.dev] Couldn't open a socket, no token provided");
      return;
    }

    const token = runtimeConfig.token;
    const roomId = await sha256(runtimeConfig.token);
    const openedWebSocket = new OpenedWebSocket(token, roomId);

    return openedWebSocket.promiseWithResolvers.promise.then(() => openedWebSocket);
  }

  public dispose() {
    this.ws.close();
  }
}

class WebSocketReporter implements Reporter {
  private openedWebSocket: OpenedWebSocket | null = null;
  private connectedPromise: Promise<void> | null;

  async open(): Promise<void> {
    const currentToken = runtimeConfig.token;
    const hasTokenChanged = this.openedWebSocket == null ? false : currentToken !== this.openedWebSocket.token;

    if (!hasTokenChanged && this.connectedPromise && this.openedWebSocket?.ws?.readyState !== WebSocket.CLOSED) {
      return this.connectedPromise!;
    }

    this.openedWebSocket?.dispose();
    this.openedWebSocket = null;

    this.connectedPromise = OpenedWebSocket.open().then((openedWebSocket) => {
      if (openedWebSocket) {
        this.openedWebSocket = openedWebSocket;
      }
    });

    return this.connectedPromise;
  }

  async registerEvent(payload: any) {
    await this.open();
    const ws = this.openedWebSocket?.ws;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Couldn't open a socket, failed to send an event");
      return;
    }

    sendRegisterEventMessage(ws, payload);
  }
}

export const reporter = new WebSocketReporter();
