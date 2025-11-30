import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RecoilRoot } from "recoil";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RecoilRoot>
      <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
        <App />
      </TonConnectUIProvider>
    </RecoilRoot>
  </StrictMode>,
);
