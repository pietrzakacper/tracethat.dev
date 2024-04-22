const env = typeof process !== "undefined" ? process.env : {};

export const runtimeConfig = {
  enabled: env.TT_DISABLE !== "true",
  serverUrl: env.TT_SERVER_URL ?? "wss://tracethat.dev",
  token: env.TT_TOKEN ?? (null as string | null),
};

export const disableDevtools = () => {
  runtimeConfig.enabled = false;
  onConfigChangeCb?.();
};

export const setServerUrl = (newUrl) => {
  runtimeConfig.serverUrl = newUrl;
  onConfigChangeCb?.();
};

let onConfigChangeCb: () => void | null;
export const onConfigChange = (cb: () => void) => {
  // set the callback after initialization
  setTimeout(() => {
    onConfigChangeCb = cb;
  }, 100);
};

export const registerToken = (token: string) => {
  runtimeConfig.token = token;
  onConfigChangeCb?.();
};
