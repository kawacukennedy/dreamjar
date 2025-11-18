import { useState, useEffect, useCallback } from "react";

interface OfflineStorageOptions {
  key: string;
  defaultValue?: any;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export const useOfflineStorage = <T = any>({
  key,
  defaultValue,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}: OfflineStorageOptions) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setStoredValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        localStorage.setItem(key, serialize(valueToStore));
      } catch (error) {
        console.error(`Error storing ${key}:`, error);
      }
    },
    [key, serialize, value],
  );

  const removeStoredValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    isOnline,
  };
};

// Hook for managing offline queue of actions
export const useOfflineQueue = () => {
  const { value: queue, setValue: setQueue } = useOfflineStorage<string[]>({
    key: "offlineQueue",
    defaultValue: [],
  });

  const addToQueue = useCallback(
    (action: string) => {
      setQueue((prev) => [...prev, action]);
    },
    [setQueue],
  );

  const removeFromQueue = useCallback(
    (action: string) => {
      setQueue((prev) => prev.filter((a) => a !== action));
    },
    [setQueue],
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, [setQueue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
};
