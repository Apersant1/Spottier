import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StoreProvider } from "./stores/storeProvider.tsx";

console.log("App is starting...");
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/tilesCache.js")
      .then((registration) => {
        console.log(
          "ServiceWorker зарегистрирован с областью:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.log("Ошибка регистрации ServiceWorker:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
