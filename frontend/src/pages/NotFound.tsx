import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  const suggestions = [
    { path: "/", label: "🏠 Home", desc: "Discover amazing dreams" },
    {
      path: "/create",
      label: "🚀 Create Dream",
      desc: "Start your own journey",
    },
    { path: "/leaderboard", label: "🏆 Leaderboard", desc: "See top dreamers" },
    {
      path: "/help",
      label: "❓ Help Center",
      desc: "Get answers to questions",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center p-8 max-w-2xl">
        <div className="mb-8">
          <div className="text-8xl mb-4">🌌</div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4">Oops! Lost in Dream Space</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            The dream page you're looking for seems to have vanished into the
            ether. Don't worry, let's get you back on track!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.path}
              to={suggestion.path}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-2xl mb-2">{suggestion.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {suggestion.desc}
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🏠 Take Me Home
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Or try searching for what you were looking for
          </p>
        </div>

        <div className="mt-12 text-xs text-gray-400 dark:text-gray-600">
          <p>
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
