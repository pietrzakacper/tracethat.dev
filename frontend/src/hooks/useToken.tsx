import { createContext, useContext, useState } from "react";

const TokenContext = createContext<[string | null, React.Dispatch<React.SetStateAction<string | null>>]>([
  null,
  () => {},
]);

export const TokenContextProvider = (props: { children: any }) => {
  const state = useState<string | null>(sessionStorage.getItem("token") || null);
  return <TokenContext.Provider value={state}>{props.children}</TokenContext.Provider>;
};

export const useToken = () => {
  const [token, setToken] = useContext(TokenContext);

  return [
    token,
    (newToken: string | null) => {
      sessionStorage.setItem("token", newToken ?? "");
      setToken(newToken);
    },
  ] as const;
};
