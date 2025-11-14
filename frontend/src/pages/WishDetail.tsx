import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useRealTime } from "../hooks/useRealTime";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";
import ShareButton from "../components/ShareButton";
import Badge from "../components/Badge";
import Comments from "../components/Comments";

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
    voteCounts: { yes: number; no: number };
  }>;
}

function WishDetail() {
  const { id } = useParams();
  const [tonConnectUI] = useTonConnectUI();
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
  const { addToast } = useToast();
  const realTimeData = useRealTime(id);

  const fetchWishJar = async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setWishJar(data);
      } else {
        addToast("Failed to load dream details", "error");
      }
    } catch (error) {
      console.error("Failed to fetch wish jar:", error);
      addToast("Failed to load dream details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishJar();
  }, [id, addToast]);

  // Real-time notifications
  useEffect(() => {
    if (realTimeData.pledges.length > (wishJar?.pledges?.length || 0)) {
      addToast("New pledge received!", "success");
    }
  }, [realTimeData.pledges, wishJar?.pledges, addToast]);

  const handlePledge = async () => {
    if (!token || !pledgeAmount) return;

    try {
      // Mock transaction data - in real app, get from backend
      const transaction = {
        validUntil: Date.now() + 1000000,
        messages: [
          {
            address: "mock_contract_address", // Should come from backend
            amount: (parseFloat(pledgeAmount) * 1000000000).toString(),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);

      // Update backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}/pledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(pledgeAmount) * 1000000000,
          }),
        },
      );

      if (response.ok) {
        addToast(`Successfully pledged ${pledgeAmount} TON!`, "success");
        setShowPledgeModal(false);
        setPledgeAmount("");
        // Refresh data
        fetchWishJar();
      } else {
        addToast("Pledge recorded, but backend update failed", "error");
      }
    } catch (error) {
      console.error("Pledge failed:", error);
      addToast("Pledge failed. Please try again.", "error");
    }
  };

  const handlePostProof = async () => {
    if (!token || !proofFile) return;

    const formData = new FormData();
    formData.append("mediaFile", proofFile);
    formData.append("caption", proofCaption);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}/proof`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        addToast("Proof posted successfully!", "success");
        setShowProofModal(false);
        setProofFile(null);
        setProofCaption("");
        fetchWishJar();
      } else {
        addToast("Failed to post proof", "error");
      }
    } catch (error) {
      console.error("Proof upload error:", error);
      addToast("Failed to post proof", "error");
    }
  };

  const handleVote = async (proofId: string, choice: "yes" | "no") => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}/proof/${proofId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ choice }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        addToast(
          `Vote recorded! Current: Yes ${data.currentCounts.yes}, No ${data.currentCounts.no}`,
          "success",
        );
        fetchWishJar();
      } else {
        addToast("Failed to vote", "error");
      }
    } catch (error) {
      console.error("Vote error:", error);
      addToast("Failed to vote", "error");
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading dream details...</div>;
  if (!wishJar) return <div>Dream not found</div>;

  const progress = (wishJar.pledgedAmount / wishJar.stakeAmount) * 100;
  const isOwner = user?.walletAddress === wishJar.ownerId.walletAddress;
  const canPledge = wishJar.status === "Active" && !isOwner;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{wishJar.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {wishJar.description}
            </p>
          </div>
          <Badge
            variant={
              wishJar.status === "Active"
                ? "info"
                : wishJar.status === "ResolvedSuccess"
                  ? "success"
                  : "danger"
            }
            size="md"
          >
            {wishJar.status}
          </Badge>
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

        <div className="flex gap-4 flex-wrap">
          {canPledge && (
            <button
              onClick={() => setShowPledgeModal(true)}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-accent focus:outline-none focus:ring-offset-2 min-h-[44px]"
              aria-label="Pledge support to this dream"
            >
              Pledge Support
            </button>
          )}
          {isOwner && wishJar.status === "Active" && (
            <button
              onClick={() => setShowProofModal(true)}
              className="bg-success text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-success focus:outline-none focus:ring-offset-2 min-h-[44px]"
              aria-label="Post progress proof"
            >
              Post Proof
            </button>
          )}

          <ShareButton url={`/wish/${wishJar._id}`} title={wishJar.title} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 id="pledges-heading" className="text-xl font-bold mb-4">
            Backers ({wishJar.pledges.length})
          </h3>
          {wishJar.pledges.length === 0 ? (
            <p className="text-gray-500">No backers yet</p>
          ) : (
            <div
              aria-labelledby="pledges-heading"
              aria-live="polite"
              className="space-y-3"
            >
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
          <h3 id="proofs-heading" className="text-xl font-bold mb-4">
            Progress Proofs ({wishJar.proofs.length})
          </h3>
          {wishJar.proofs.length === 0 ? (
            <p className="text-gray-500">No proofs posted yet</p>
          ) : (
            <div aria-labelledby="proofs-heading" className="space-y-4">
              {wishJar.proofs.map((proof) => (
                <div key={proof._id} className="border rounded p-3">
                  <img
                    src={proof.mediaURI}
                    alt={proof.caption || "Proof of progress"}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-sm">{proof.caption}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    By{" "}
                    {proof.uploaderId.displayName ||
                      proof.uploaderId.walletAddress.slice(0, 6) + "..."}{" "}
                    • {new Date(proof.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleVote(proof._id, "yes")}
                      className="bg-success text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-success focus:outline-none focus:ring-offset-2"
                      aria-label={`Vote yes for this proof, current yes votes: ${proof.voteCounts.yes}`}
                    >
                      Yes ({proof.voteCounts.yes})
                    </button>
                    <button
                      onClick={() => handleVote(proof._id, "no")}
                      className="bg-danger text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-danger focus:outline-none focus:ring-offset-2"
                      aria-label={`Vote no for this proof, current no votes: ${proof.voteCounts.no}`}
                    >
                      No ({proof.voteCounts.no})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Community Discussion</h3>
        <Comments wishId={id!} />
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
            onClick={() => {
              if (voteChoice) {
                handleVote("mock_proof_id", voteChoice);
                setShowVoteModal(false);
                setVoteChoice(null);
              }
            }}
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
