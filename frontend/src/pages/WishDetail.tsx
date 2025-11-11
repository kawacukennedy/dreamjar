import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
  ownerId: { displayName?: string; walletAddress: string };
  pledges: Array<{
    _id: string;
    supporterId: { displayName?: string; walletAddress: string };
    amount: number;
    createdAt: string;
  }>;
  proofs: Array<{
    _id: string;
    uploaderId: { displayName?: string; walletAddress: string };
    mediaURI: string;
    caption?: string;
    createdAt: string;
  }>;
}

function WishDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [wishJar, setWishJar] = useState<WishJar | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteChoice, setVoteChoice] = useState<"yes" | "no" | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofCaption, setProofCaption] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setWishJar({
        _id: id || "",
        title: "Run Marathon",
        description: "Complete a full marathon in under 4 hours",
        stakeAmount: 1000000000,
        pledgedAmount: 500000000,
        deadline: "2024-12-31",
        status: "Active",
        ownerId: { displayName: "Alice", walletAddress: "0x..." },
        pledges: [
          {
            _id: "1",
            supporterId: { displayName: "Bob", walletAddress: "0x..." },
            amount: 100000000,
            createdAt: "2024-10-01",
          },
        ],
        proofs: [
          {
            _id: "1",
            uploaderId: { displayName: "Alice", walletAddress: "0x..." },
            mediaURI: "https://example.com/image.jpg",
            caption: "Training run completed!",
            createdAt: "2024-10-05",
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handlePledge = async () => {
    if (!token || !pledgeAmount) return;
    // TODO: Implement pledge API call
    alert(`Pledged ${pledgeAmount} TON!`);
    setShowPledgeModal(false);
    setPledgeAmount("");
  };

  const handlePostProof = async () => {
    if (!token || !proofFile) return;
    // TODO: Implement proof upload
    alert("Proof posted!");
    setShowProofModal(false);
    setProofFile(null);
    setProofCaption("");
  };

  const handleVote = async () => {
    if (!token || !voteChoice) return;
    // TODO: Implement voting API
    alert(`Voted ${voteChoice}!`);
    setShowVoteModal(false);
    setVoteChoice(null);
  };

  if (loading)
    return <div className="text-center py-8">Loading dream details...</div>;
  if (!wishJar) return <div>Dream not found</div>;

  const progress = (wishJar.pledgedAmount / wishJar.stakeAmount) * 100;
  const isOwner = user?.walletAddress === wishJar.ownerId.walletAddress;
  const canPledge = wishJar.status === "Active" && !isOwner;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{wishJar.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {wishJar.description}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm ${
              wishJar.status === "Active"
                ? "bg-accent text-white"
                : wishJar.status === "ResolvedSuccess"
                  ? "bg-success text-white"
                  : "bg-danger text-white"
            }`}
          >
            {wishJar.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Created by</p>
            <p className="font-medium">
              {wishJar.ownerId.displayName ||
                wishJar.ownerId.walletAddress.slice(0, 6) + "..."}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="font-medium">
              {new Date(wishJar.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Pledged: {wishJar.pledgedAmount / 1000000000} TON</span>
            <span>Goal: {wishJar.stakeAmount / 1000000000} TON</span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        <div className="flex gap-4">
          {canPledge && (
            <button
              onClick={() => setShowPledgeModal(true)}
              className="bg-accent text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            >
              Pledge Support
            </button>
          )}
          {isOwner && wishJar.status === "Active" && (
            <button
              onClick={() => setShowProofModal(true)}
              className="bg-success text-white px-6 py-2 rounded hover:bg-green-600 transition"
            >
              Post Proof
            </button>
          )}
          {isOwner &&
            new Date(wishJar.deadline) <= new Date() &&
            wishJar.status === "Active" && (
              <button
                onClick={() => setShowVoteModal(true)}
                className="bg-warning text-white px-6 py-2 rounded hover:bg-yellow-600 transition"
              >
                Start Voting
              </button>
            )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">
            Backers ({wishJar.pledges.length})
          </h3>
          {wishJar.pledges.length === 0 ? (
            <p className="text-gray-500">No backers yet</p>
          ) : (
            <div className="space-y-3">
              {wishJar.pledges.map((pledge) => (
                <div
                  key={pledge._id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {pledge.supporterId.displayName ||
                      pledge.supporterId.walletAddress.slice(0, 6) + "..."}
                  </span>
                  <span className="font-medium">
                    {pledge.amount / 1000000000} TON
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">
            Progress Proofs ({wishJar.proofs.length})
          </h3>
          {wishJar.proofs.length === 0 ? (
            <p className="text-gray-500">No proofs posted yet</p>
          ) : (
            <div className="space-y-4">
              {wishJar.proofs.map((proof) => (
                <div key={proof._id} className="border rounded p-3">
                  <img
                    src={proof.mediaURI}
                    alt="Proof"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-sm">{proof.caption}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    By{" "}
                    {proof.uploaderId.displayName ||
                      proof.uploaderId.walletAddress.slice(0, 6) + "..."}{" "}
                    • {new Date(proof.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pledge Modal */}
      <Modal
        isOpen={showPledgeModal}
        onClose={() => setShowPledgeModal(false)}
        title="Pledge Support"
      >
        <div className="space-y-4">
          <p>Support this dream by pledging TON tokens!</p>
          <input
            type="number"
            placeholder="Amount in TON"
            value={pledgeAmount}
            onChange={(e) => setPledgeAmount(e.target.value)}
            className="w-full p-3 border rounded dark:bg-gray-700"
            step="0.01"
            min="0.01"
          />
          <button
            onClick={handlePledge}
            className="w-full bg-accent text-white p-3 rounded hover:bg-blue-600 transition"
          >
            Pledge {pledgeAmount} TON
          </button>
        </div>
      </Modal>

      {/* Proof Modal */}
      <Modal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        title="Post Proof"
      >
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            className="w-full p-3 border rounded dark:bg-gray-700"
          />
          <textarea
            placeholder="Caption (optional)"
            value={proofCaption}
            onChange={(e) => setProofCaption(e.target.value)}
            className="w-full p-3 border rounded dark:bg-gray-700 h-24"
          />
          <button
            onClick={handlePostProof}
            className="w-full bg-success text-white p-3 rounded hover:bg-green-600 transition"
          >
            Post Proof
          </button>
        </div>
      </Modal>

      {/* Vote Modal */}
      <Modal
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        title="Vote on Dream Completion"
      >
        <div className="space-y-4">
          <p>Has the dreamer successfully completed their goal?</p>
          <div className="flex gap-4">
            <button
              onClick={() => setVoteChoice("yes")}
              className={`flex-1 p-3 rounded transition ${
                voteChoice === "yes"
                  ? "bg-success text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              ✅ Yes - Success!
            </button>
            <button
              onClick={() => setVoteChoice("no")}
              className={`flex-1 p-3 rounded transition ${
                voteChoice === "no"
                  ? "bg-danger text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              ❌ No - Failed
            </button>
          </div>
          <button
            onClick={handleVote}
            disabled={!voteChoice}
            className="w-full bg-primary text-white p-3 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            Submit Vote
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default WishDetail;
