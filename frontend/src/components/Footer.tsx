import { Link } from "react-router-dom";
import { VERSION } from "../version";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DreamJar</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Turn your dreams into smart contracts on TON. Stake, share, and
              achieve together!
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/" className="hover:text-primary">
                  Discover Dreams
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-primary">
                  Create Dream
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-primary">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/help" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="/terms" className="hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 DreamJar. All rights reserved. v{VERSION}</p>
          <p className="text-sm mt-2">Powered by TON Blockchain</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
