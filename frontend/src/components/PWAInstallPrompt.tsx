import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import Modal from "./Modal";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Auto-show prompt after 30 seconds if not dismissed
      setTimeout(() => {
        if (deferredPrompt && !isInstalled) {
          setShowInstallModal(true);
        }
      }, 30000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      addToast("DreamJar installed successfully! 🎉", "success");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt, isInstalled, addToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        addToast("Installing DreamJar...", "info");
      }

      setDeferredPrompt(null);
      setShowInstallModal(false);
    } catch (error) {
      console.error("Install prompt failed:", error);
      addToast("Installation failed. Please try again.", "error");
    }
  };

  const handleDismiss = () => {
    setShowInstallModal(false);
    // Don't show again for 7 days
    localStorage.setItem("pwaPromptDismissed", Date.now().toString());
  };

  // Don't show if dismissed recently
  const lastDismissed = localStorage.getItem("pwaPromptDismissed");
  if (
    lastDismissed &&
    Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000
  ) {
    return null;
  }

  if (isInstalled || !deferredPrompt) return null;

  return (
    <>
      {/* Floating Install Button */}
      <button
        onClick={() => setShowInstallModal(true)}
        className="fixed bottom-20 right-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-110 animate-bounce"
        aria-label="Install DreamJar app"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Install Modal */}
      <Modal
        isOpen={showInstallModal}
        onClose={handleDismiss}
        title="Install DreamJar"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">📱</div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Install DreamJar App</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get the full DreamJar experience with offline access, push
              notifications, and native app feel!
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              ✨ <strong>Benefits:</strong> Offline access, instant
              notifications, better performance
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Install Now
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PWAInstallPrompt;
