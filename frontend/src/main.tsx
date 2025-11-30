import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import posthog from "posthog-js";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

// Initialize PostHog
posthog.init("phc_xxx", {
  // Replace with actual key
  api_host: "https://app.posthog.com",
  loaded: (posthog) => {
    if (process.env.NODE_ENV === "development") posthog.debug();
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RecoilRoot>
        <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
          <App />
        </TonConnectUIProvider>
      </RecoilRoot>
    </BrowserRouter>
  </StrictMode>,
);
