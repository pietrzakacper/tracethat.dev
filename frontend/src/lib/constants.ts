// get the server url without trailing slash
export const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
// events reported from the server (landing page)
export const LANDING_TOKEN = "trace-that-landing";
// events reported from the client
export const CLIENT_TOKEN = "trace-that-client";
