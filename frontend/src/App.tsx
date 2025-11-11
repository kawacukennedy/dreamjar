import { useEffect, useState, lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { inject } from "@vercel/analytics";
import posthog from "posthog-js";
import { TonConnectUIProvider, useTonConnectUI } from "@tonconnect/ui-react";
import WebApp from "@twa-dev/sdk";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useToast } from "./contexts/ToastContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";

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
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Initialize TWA SDK
    WebApp.ready();
    WebApp.expand();

    // Set up back button
    WebApp.BackButton.onClick(() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        WebApp.close();
      }
    });

    // Set up main button
    WebApp.MainButton.setText("Create Dream");
    WebApp.MainButton.onClick(() => {
      navigate("/create");
    });

    // Show/hide buttons based on page
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === "/") {
        WebApp.BackButton.hide();
        WebApp.MainButton.show();
      } else if (path === "/create") {
        WebApp.BackButton.show();
        WebApp.MainButton.hide();
      } else {
        WebApp.BackButton.show();
        WebApp.MainButton.hide();
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);

    // Show onboarding for new users (skip in TWA)
    if (!WebApp.initData) {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [navigate]);

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

      // Sign message
      const signedMessage = await tonConnectUI.signMessage(challengeMessage);

      // Verify
      await login(address, signedMessage, challengeMessage);
      addToast("Wallet connected successfully!", "success");
    } catch (error) {
      console.error("Auto-login failed:", error);
      addToast("Failed to connect wallet", "error");
    }
  };

  return (
    <Router>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark text-gray-900 dark:text-gray-100">
        <Header />
        <main id="main-content" className="container mx-auto p-4">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner className="mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading DreamJar...
                  </p>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateWish />} />
              <Route path="/wish/:id" element={<WishDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
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
          <ThemeProvider>
            <DarkModeProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </DarkModeProvider>
          </ThemeProvider>
        </ToastProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

export default App;
