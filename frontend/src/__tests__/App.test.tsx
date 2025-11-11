import { render, screen } from "@testing-library/react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import App from "../App";

test("renders DreamJar title", () => {
  render(
    <TonConnectUIProvider manifestUrl="https://example.com/manifest.json">
      <App />
    </TonConnectUIProvider>,
  );
  const titleElement = screen.getByText(/DreamJar/i);
  expect(titleElement).toBeInTheDocument();
});
