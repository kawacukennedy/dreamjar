import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
  ownerId: { displayName: string };
  pledges: any[];
  proofs: any[];
}

function WishDetail() {
  const { id } = useParams();
  const [wishJar, setWishJar] = useState<WishJar | null>(null);

  useEffect(() => {
    // TODO: Fetch from API
    setWishJar({
      _id: id || "",
      title: "Run Marathon",
      description: "Complete a full marathon",
      stakeAmount: 1000000000,
      pledgedAmount: 500000000,
      deadline: "2024-12-31",
      status: "Active",
      ownerId: { displayName: "User" },
      pledges: [],
      proofs: [],
    });
  }, [id]);

  if (!wishJar) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{wishJar.title}</h2>
      <p>{wishJar.description}</p>
      <p>By: {wishJar.ownerId.displayName}</p>
      <p>Stake: {wishJar.stakeAmount / 1000000000} TON</p>
      <p>Pledged: {wishJar.pledgedAmount / 1000000000} TON</p>
      <p>Deadline: {wishJar.deadline}</p>
      <p>Status: {wishJar.status}</p>
      <button className="bg-accent text-white p-2 rounded mt-4">Pledge</button>
      <div className="mt-4">
        <h3>Proofs</h3>
        {/* TODO: List proofs */}
      </div>
    </div>
  );
}

export default WishDetail;
