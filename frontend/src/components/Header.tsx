import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useTheme } from "../contexts/ThemeContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              DreamJar
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/"
                  ? "text-primary bg-primary/10"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/leaderboard"
                  ? "text-primary bg-primary/10"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary"
              }`}
            >
              Leaderboard
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/profile"
                    ? "text-primary bg-primary/10"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary"
                }`}
              >
                Profile
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary"
              aria-label="Select theme"
            >
              <option value="default">Default</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.displayName || user.walletAddress.slice(0, 6) + "..."}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/profile"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
