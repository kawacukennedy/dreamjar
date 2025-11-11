import { useEffect } from "react";
import { TonConnectUIProvider, useTonConnectUI } from "@tonconnect/ui-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { init } from "@twa-dev/sdk";
import Home from "./pages/Home";
import CreateWish from "./pages/CreateWish";
import WishDetail from "./pages/WishDetail";
import "./App.css";

function AppContent() {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    init();
  }, []);

  const handleConnect = async () => {
    try {
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
        <header className="bg-primary text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DreamJar</h1>
          <div>
            {tonConnectUI.connected ? (
              <button
                onClick={handleDisconnect}
                className="bg-danger text-white px-4 py-2 rounded"
              >
                Disconnect Wallet
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-accent text-white px-4 py-2 rounded"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateWish />} />
            <Route path="/wish/:id" element={<WishDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://your-domain.com/tonconnect-manifest.json">
      <AppContent />
    </TonConnectUIProvider>
  );
}

export default App;
