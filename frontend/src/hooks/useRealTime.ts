import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

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
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!wishId || !token) return;

    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:8080",
      {
        auth: { token },
      },
    );

    newSocket.on("connect", () => {
      newSocket.emit("join-wish", wishId);
    });

    newSocket.on("new-pledge", (pledge) => {
      setData((prev) => ({
        ...prev,
        pledges: [...prev.pledges, pledge],
      }));
    });

    newSocket.on("new-proof", (proof) => {
      setData((prev) => ({
        ...prev,
        proofs: [...prev.proofs, proof],
      }));
    });

    newSocket.on("new-vote", (vote) => {
      setData((prev) => ({
        ...prev,
        votes: [...prev.votes, vote],
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [wishId, token]);

  return data;
};
