import { useState, useEffect, useCallback } from "react";
import localforage from "localforage";

interface OfflineStorageOptions {
  key: string;
  defaultValue?: any;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export const useOfflineStorage = <T = any>({
  key,
  defaultValue,
}: OfflineStorageOptions) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await localforage.getItem<T>(key);
        setValue(item ?? defaultValue);
      } catch {
        setValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };
    loadValue();
  }, [key, defaultValue]);

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
    async (newValue: T | ((prevValue: T) => T)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        await localforage.setItem(key, valueToStore);
      } catch (error) {
        console.error(`Error storing ${key}:`, error);
      }
    },
    [key, value],
  );

  const removeStoredValue = useCallback(async () => {
    try {
      await localforage.removeItem(key);
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
    loading,
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
