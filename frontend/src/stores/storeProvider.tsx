// src/stores/StoreProvider.tsx
import React, { createContext } from "react";
import { stores, StoresType } from "./index";

export const StoreContext = createContext<StoresType | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
  );
};
