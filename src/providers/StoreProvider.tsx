import type { ReactNode } from "react";
import { StoreContext, rootStore } from "./StoreContext";

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
}
