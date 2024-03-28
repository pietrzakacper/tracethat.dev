const env = typeof process !== 'undefined' ? process.env : {};

export const runtimeConfig = {
  enabled: env.TT_DISABLE !== 'true',
  serverUrl:  env.TT_SERVER_URL ?? "wss://tracethat.dev",
  token: env.TT_TOKEN ?? null as string | null,
}

export const disableDevtools = () => {
  runtimeConfig.enabled = false;
};

export const setServerUrl = (newUrl) => {
  runtimeConfig.serverUrl = newUrl;
};

export const registerToken = (token: string) => {
  runtimeConfig.token = token;
};
