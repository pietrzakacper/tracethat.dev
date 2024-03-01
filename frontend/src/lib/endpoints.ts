// get the server url without trailing slash
const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");

export const ENDPOINTS = {
  events: (params: { roomId: string, sessionId: string }) =>
    `${SERVER_URL}/api/events?roomId=${params.roomId}&sessionId=${params.sessionId}`
} as const

