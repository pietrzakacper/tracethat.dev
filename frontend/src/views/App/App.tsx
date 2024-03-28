import { LocationContextProvider, useLocation } from "@/hooks/useSearchParam";
import { Root } from "../Root/Root";
import { ThemeProvider } from "@/components/ui/theme-provider";

export const App = () => {
  const location = useLocation();
  return (
    <ThemeProvider defaultTheme="dark">
      <LocationContextProvider value={location}>
        <Root />
      </LocationContextProvider>
    </ThemeProvider>
  );
};
