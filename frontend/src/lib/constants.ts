// get the server url without trailing slash
export const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
export const LANDING_TOKEN = "trace-that-landing";
