import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
}

function Home() {
  const [wishJars, setWishJars] = useState<WishJar[]>([]);

  useEffect(() => {
    // TODO: Fetch wish jars from API
    setWishJars([
      {
        _id: "1",
        title: "Run Marathon",
        description: "Complete a full marathon",
        stakeAmount: 1000000000,
        pledgedAmount: 500000000,
        deadline: "2024-12-31",
        status: "Active",
      },
    ]);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Discover Dreams</h2>
      <div className="grid gap-4">
        {wishJars.map((jar) => (
          <div key={jar._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{jar.title}</h3>
            <p>{jar.description}</p>
            <p>Stake: {jar.stakeAmount / 1000000000} TON</p>
            <p>Pledged: {jar.pledgedAmount / 1000000000} TON</p>
            <Link to={`/wish/${jar._id}`} className="text-primary">
              View Details
            </Link>
          </div>
        ))}
      </div>
      <Link
        to="/create"
        className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full"
      >
        +
      </Link>
    </div>
  );
}

export default Home;
