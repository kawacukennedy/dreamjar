import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useOfflineQueue } from "../hooks/useOfflineStorage";

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { addToast } = useToast();
  const { queue } = useOfflineQueue();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("You're back online! 🌐", "success");
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast("You're offline. Some features may be limited. 📴", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast]);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-sm font-medium">You're currently offline</span>
        </div>
        {queue.length > 0 && (
          <div className="text-xs bg-orange-600 px-2 py-1 rounded-full">
            {queue.length} pending
          </div>
        )}
      </div>
      <div className="text-xs mt-2 opacity-90">
        Some features may not be available. Your actions will be synced when
        you're back online.
      </div>
    </div>
  );
};

export default OfflineIndicator;
