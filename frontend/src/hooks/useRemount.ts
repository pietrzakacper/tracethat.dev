import { useState } from "react";

export function useRemount() {
  const [mounted, setMounted] = useState(true);

  return {
    mounted,
    remount: () => {
      setMounted(false);
      setTimeout(() => {
        setMounted(true);
      }, 0);
    },
  };
}
