import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

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
