import { useEffect, useState } from "react";
import { useEffect, lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { inject } from "@vercel/analytics";
import posthog from "posthog-js";
import { TonConnectUIProvider, useTonConnectUI } from "@tonconnect/ui-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import init from "@twa-dev/sdk";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DarkModeProvider, useDarkMode } from "./contexts/DarkModeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { useNotifications } from "./hooks/useNotifications";
import Onboarding from "./components/Onboarding";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const CreateWish = lazy(() => import("./pages/CreateWish"));
const WishDetail = lazy(() => import("./pages/WishDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
import "./App.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/your-domain\.com/],
    }),
    Sentry.replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

posthog.init(import.meta.env.VITE_POSTHOG_KEY || "mock_key", {
  api_host: "https://app.posthog.com",
});

inject();

function AppContent() {
  const [tonConnectUI] = useTonConnectUI();
  const { login, logout, user } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { permission, requestPermission } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    init();
    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    // Request notification permission
    if (permission === "default") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (tonConnectUI.connected && !user) {
      // Auto-login when wallet connects
      handleWalletLogin();
    }
  }, [tonConnectUI.connected, user]);

  const handleWalletLogin = async () => {
    try {
      const address = tonConnectUI.account?.address;
      if (!address) return;

      // Get challenge
      const challengeResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/wallet-challenge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        },
      );
      const { challengeMessage } = await challengeResponse.json();

      // Sign message - TODO: implement proper signing
      // const signedMessage = await tonConnectUI.signMessage(challengeMessage);

      // Verify - TODO: implement
      // await login(address, signedMessage, challengeMessage);
    } catch (error) {
      console.error("Auto-login failed:", error);
    }
  };

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
      logout();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark text-gray-900 dark:text-gray-100">
        <header className="bg-primary text-white p-4 flex justify-between items-center shadow-lg">
          <h1 className="text-2xl font-bold">DreamJar</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition"
              title="Toggle dark mode"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            {user && (
              <span className="text-sm">
                Welcome, {user.displayName || user.walletAddress.slice(0, 6)}...
              </span>
            )}
            {tonConnectUI.connected ? (
              <button
                onClick={handleDisconnect}
                className="bg-danger text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-accent text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>
        <nav className="bg-white dark:bg-gray-800 shadow p-2">
          <div className="flex space-x-4">
            <a href="/" className="text-primary hover:underline">
              Home
            </a>
            <a href="/create" className="text-primary hover:underline">
              Create Dream
            </a>
            <a href="/leaderboard" className="text-primary hover:underline">
              Leaderboard
            </a>
            <a href="/profile" className="text-primary hover:underline">
              Profile
            </a>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateWish />} />
              <Route path="/wish/:id" element={<WishDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      <Onboarding
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem("hasSeenOnboarding", "true");
        }}
      />
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TonConnectUIProvider manifestUrl="https://your-domain.com/tonconnect-manifest.json">
        <ToastProvider>
          <DarkModeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </DarkModeProvider>
        </ToastProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

export default App;
