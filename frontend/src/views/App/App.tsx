import { TokenContextProvider } from "@/hooks/useToken";
import { Root } from "../Root/Root";
import { ThemeProvider } from "@/components/ui/theme-provider";

export const App = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <TokenContextProvider>
        <Root />
      </TokenContextProvider>
    </ThemeProvider>
  );
};
