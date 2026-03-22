import { useContext } from "react";
import { StoreContext } from "./StoreContext";
import type { RootStore } from "../stores/RootStore";

export function useStores(): RootStore {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw new Error("useStores must be used inside StoreProvider");
  }

  return context;
}
