import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useTheme } from "../contexts/ThemeContext";
import NotificationBell from "./NotificationBell";
import i18n from "../i18n";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [tonConnectUI] = useTonConnectUI();
  const { user, login, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const handleWalletConnect = async () => {
    try {
      await tonConnectUI.connectWallet();
      const wallet = tonConnectUI.wallet;
      if (wallet) {
        // Get challenge from backend
        const challengeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/wallet-challenge`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: wallet.account.address }),
          },
        );
        const { challenge } = await challengeResponse.json();

        // Sign the challenge
        const signed = await tonConnectUI.signMessage(challenge);

        // Verify with backend
        await login(wallet.account.address, signed, challenge);
      }
    } catch (error) {
      console.error("Wallet connect failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobileMenuOpen]);

  // Focus management for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const firstFocusableElement = mobileMenuRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement;
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: "/", label: t("home"), ariaLabel: t("go_to_home") },
    {
      to: "/leaderboard",
      label: t("leaderboard"),
      ariaLabel: t("view_leaderboard"),
    },
    {
      to: "/notifications",
      label: t("notifications"),
      ariaLabel: t("view_notifications"),
    },
    { to: "/settings", label: t("settings"), ariaLabel: t("go_to_settings") },
    { to: "/help", label: t("help"), ariaLabel: t("get_help") },
    ...(user
      ? [{ to: "/profile", label: t("profile"), ariaLabel: t("view_profile") }]
      : []),
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label={t("dreamjar_home")}
            >
              DreamJar
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex space-x-8"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  location.pathname === link.to
                    ? "text-primary bg-primary/10"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
                }`}
                aria-label={link.ariaLabel}
                aria-current={
                  location.pathname === link.to ? "page" : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={t("toggle_mobile_menu")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NotificationBell />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="p-3 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label={t("select_theme")}
            >
              <option value="default">Default</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="p-3 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={isDark ? t("switch_to_light") : t("switch_to_dark")}
              aria-pressed={isDark}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span
                  className="text-sm text-gray-700 dark:text-gray-300"
                  aria-label={t("current_user")}
                >
                  {user.displayName || user.walletAddress.slice(0, 6) + "..."}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  aria-label={t("logout_account")}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletConnect}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                aria-label={t("connect_ton_wallet")}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            role="navigation"
            aria-label={t("mobile_navigation")}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
                  }`}
                  aria-label={link.ariaLabel}
                  aria-current={
                    location.pathname === link.to ? "page" : undefined
                  }
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center justify-between px-3">
                    <label
                      htmlFor="mobile-theme-select"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t("theme")}
                    </label>
                    <select
                      id="mobile-theme-select"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="p-3 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
                      aria-label={t("select_theme")}
                    >
                      <option value="default">Default</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between px-3">
                    <label
                      htmlFor="mobile-lang-select"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Language
                    </label>
                    <select
                      id="mobile-lang-select"
                      value={currentLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="p-3 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
                      aria-label="Select language"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className="w-full mt-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={
                    isDark ? t("switch_to_light") : t("switch_to_dark")
                  }
                  aria-pressed={isDark}
                >
                  {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      Signed in as:{" "}
                      {user.displayName ||
                        user.walletAddress.slice(0, 6) + "..."}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="w-full px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
                      aria-label={t("logout_account")}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleWalletConnect();
                      closeMobileMenu();
                    }}
                    className="w-full px-3 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary text-left"
                    aria-label={t("connect_ton_wallet")}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
