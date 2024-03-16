export const runtimeConfig = {
  enabled: true,
  serverUrl: "wss://tracethat.dev/api/report",
  token: null as string | null,
};

export const disableDevtools = () => {
  runtimeConfig.enabled = false;
};

export const setServerUrl = (newUrl) => {
  runtimeConfig.serverUrl = newUrl;
};

export const registerToken = (token: string) => {
  runtimeConfig.token = token;
};
