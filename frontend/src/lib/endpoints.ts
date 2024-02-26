// get the server url without traling slash
const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '')

export const ENDPOINTS = {
    events: (params: { token: string, sessionId: string }) =>
        `${SERVER_URL}/api/events?token=${params.token}&sessionId=${params.sessionId}`
} as const

