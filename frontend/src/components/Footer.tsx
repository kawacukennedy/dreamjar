const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-12 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">DreamJar</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Turn your dreams into smart contracts on TON.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/create"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Create Dream
                </a>
              </li>
              <li>
                <a
                  href="/leaderboard"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Leaderboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 DreamJar. Built on TON Blockchain. v
            {import.meta.env.VITE_VERSION || "1.0.0"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
