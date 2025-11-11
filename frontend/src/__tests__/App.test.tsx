import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders DreamJar title", () => {
    render(
      <TonConnectUIProvider manifestUrl="https://example.com/manifest.json">
        <App />
      </TonConnectUIProvider>,
    );
    const titleElement = screen.getByText(/DreamJar/i);
    expect(titleElement).toBeInTheDocument();
  });
});
