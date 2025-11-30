import { useEffect, useState, lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { inject } from "@vercel/analytics";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate } from "react-router-dom";

// Conditional imports
let posthog: any = null;
let WebApp: any = null;

try {
  posthog = require("posthog-js");
} catch (e) {
  // PostHog not available
}

try {
  WebApp = require("@twa-dev/sdk");
} catch (e) {
  // TWA SDK not available
}

import { AuthProvider } from "./contexts/AuthContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SearchProvider } from "./contexts/SearchContext";

import Onboarding from "./components/Onboarding";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Footer from "./components/Footer";
import Header from "./components/Header";

const Home = lazy(() => import("./pages/Home"));
const CreateWish = lazy(() => import("./pages/CreateWish"));
const WishDetail = lazy(() => import("./pages/WishDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
import "./App.css";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

if (
  posthog &&
  import.meta.env.VITE_POSTHOG_KEY &&
  import.meta.env.VITE_POSTHOG_KEY !== "mock_key"
) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: "https://app.posthog.com",
  });
}

try {
  inject();
} catch (e) {
  console.warn("Vercel analytics not available:", e);
}

function AppContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Initialize TWA SDK if in Telegram
    if (WebApp && WebApp.initData) {
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

      return () => {
        window.removeEventListener("popstate", handleLocationChange);
      };
    } else {
      // Show onboarding for new users (web only)
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [navigate]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50"
      >
        {t("skip_to_main_content")}
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
                    {t("loading_dreamjar")}
                  </p>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wish/:wishId" element={<WishDetail />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateWish />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div>Admin Dashboard</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/trending" element={<Leaderboard />} />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
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

      <PWAInstallPrompt />
      <OfflineIndicator />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <DarkModeProvider>
            <AuthProvider>
              <NotificationProvider>
                <SearchProvider>
                  <AppContent />
                </SearchProvider>
              </NotificationProvider>
            </AuthProvider>
          </DarkModeProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
