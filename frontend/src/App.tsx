import { useEffect, useState, lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { inject } from "@vercel/analytics";
import posthog from "posthog-js";
import { TonConnectUIProvider, useTonConnectUI } from "@tonconnect/ui-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DarkModeProvider, useDarkMode } from "./contexts/DarkModeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { useNotifications } from "./hooks/useNotifications";
import Onboarding from "./components/Onboarding";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Footer from "./components/Footer";
import Header from "./components/Header";

const Home = lazy(() => import("./pages/Home"));
const CreateWish = lazy(() => import("./pages/CreateWish"));
const WishDetail = lazy(() => import("./pages/WishDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
import "./App.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // integrations: [], // TODO: add proper integrations
  tracesSampleRate: 1.0,
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
});

posthog.init(import.meta.env.VITE_POSTHOG_KEY || "mock_key", {
  api_host: "https://app.posthog.com",
});

inject();

function AppContent() {
  const [tonConnectUI] = useTonConnectUI();
  const { logout, user } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { permission, requestPermission } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // init(); // TODO: initialize TWA SDK
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
      // TODO: implement wallet challenge
      // await fetch(`${import.meta.env.VITE_API_URL}/auth/wallet-challenge`, ...);

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
        <Header />
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
