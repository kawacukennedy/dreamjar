import { useEffect } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { init } from "@twa-dev/sdk";
import "./App.css";

function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://your-domain.com/tonconnect-manifest.json">
      <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
        <header className="bg-primary text-white p-4">
          <h1 className="text-2xl font-bold">DreamJar</h1>
        </header>
        <main className="p-4">
          <p>Welcome to DreamJar - Turn your dreams into smart contracts!</p>
          {/* TODO: Add routing and components */}
        </main>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
