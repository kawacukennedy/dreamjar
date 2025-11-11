import React from "react";

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
  ownerId: { displayName?: string; walletAddress: string };
}

function Home() {
  const [wishJars, setWishJars] = useState<WishJar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setWishJars([
        {
          _id: "1",
          title: "Run Marathon",
          description: "Complete a full marathon in under 4 hours",
          stakeAmount: 1000000000,
          pledgedAmount: 500000000,
          deadline: "2024-12-31",
          status: "Active",
          ownerId: { displayName: "Alice", walletAddress: "0x..." },
        },
        {
          _id: "2",
          title: "Learn Guitar",
          description: "Master 10 songs on guitar",
          stakeAmount: 500000000,
          pledgedAmount: 200000000,
          deadline: "2024-11-30",
          status: "Active",
          ownerId: { walletAddress: "0x..." },
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-2 w-full mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}

export default Home;
