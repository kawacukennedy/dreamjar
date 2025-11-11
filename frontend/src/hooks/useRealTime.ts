import { useEffect, useState } from "react";

interface RealTimeData {
  pledges: any[];
  votes: any[];
  proofs: any[];
}

export const useRealTime = (wishId?: string) => {
  const [data, setData] = useState<RealTimeData>({
    pledges: [],
    votes: [],
    proofs: [],
  });

  useEffect(() => {
    if (!wishId) return;

    // Mock real-time updates with polling
    const interval = setInterval(() => {
      // Simulate new data
      setData((prev) => ({
        ...prev,
        pledges: [
          ...prev.pledges,
          { id: Date.now(), amount: Math.random() * 100 },
        ],
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [wishId]);

  return data;
};
