// src/stores/useStores.ts
import { useContext } from "react";
import { StoreContext } from "./storeProvider";
import { StoresType } from "./index";

export const useStores = (): StoresType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStores must be used within a StoreProvider");
  }
  return context;
};
