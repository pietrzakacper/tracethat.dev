import { SERVER_URL } from "./constants";

export const ENDPOINTS = {
  events: (params: { roomId: string; sessionId: string }) =>
    `${SERVER_URL}/api/events?roomId=${params.roomId}&sessionId=${params.sessionId}`,
  report: () => `${SERVER_URL.replace("http", "ws")}/api/report`,
} as const;
