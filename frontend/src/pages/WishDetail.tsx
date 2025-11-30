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
import Milestones from "../components/Milestones";
import FollowButton from "../components/FollowButton";
import OptimizedImage from "../components/OptimizedImage";
import Avatar from "../components/Avatar";
import Button from "../components/Button";

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    "❤️": 0,
    "👍": 0,
    "🎉": 0,
    "🔥": 0,
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
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

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("mediaFile", proofFile);
    formData.append("caption", proofCaption);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

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

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        addToast("Proof posted successfully!", "success");
        setShowProofModal(false);
        setProofFile(null);
        setProofCaption("");
        setUploadProgress(0);
        fetchWishJar();
      } else {
        addToast("Failed to post proof", "error");
      }
    } catch (error) {
      console.error("Proof upload error:", error);
      addToast("Failed to post proof", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
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

  const handleLike = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}/like`,
        {
          method: liked ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setLiked(!liked);
        addToast(
          liked ? "Removed from favorites" : "Added to favorites",
          "success",
        );
      }
    } catch (error) {
      addToast("Failed to update favorite", "error");
    }
  };

  const handleBookmark = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}/bookmark`,
        {
          method: bookmarked ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setBookmarked(!bookmarked);
        addToast(bookmarked ? "Removed bookmark" : "Bookmarked!", "success");
      }
    } catch (error) {
      addToast("Failed to update bookmark", "error");
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!token) return;

    const newReaction = userReaction === emoji ? null : emoji;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wish/${id}/react`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji: newReaction }),
        },
      );

      if (response.ok) {
        const updatedReactions = { ...reactions };

        // Remove previous reaction
        if (userReaction && updatedReactions[userReaction] > 0) {
          updatedReactions[userReaction]--;
        }

        // Add new reaction
        if (newReaction) {
          updatedReactions[newReaction] =
            (updatedReactions[newReaction] || 0) + 1;
        }

        setReactions(updatedReactions);
        setUserReaction(newReaction);
        addToast(
          newReaction ? `Reacted with ${emoji}` : "Removed reaction",
          "success",
        );
      }
    } catch (error) {
      addToast("Failed to add reaction", "error");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setProofFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setProofFile(files[0]);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading dream details...</div>;
  if (!wishJar) return <div>Dream not found</div>;

  const progress = (wishJar.pledgedAmount / wishJar.stakeAmount) * 100;
  const isOwner = user?.walletAddress === wishJar.ownerId.walletAddress;
  const canPledge = wishJar.status === "Active" && !isOwner;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - 680px content */}
        <div className="lg:w-[680px] space-y-6">
          {/* Title and Creator Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-h1 font-bold mb-2">{wishJar.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-body">
                  {wishJar.description}
                </p>
              </div>
              <Badge
                variant={
                  wishJar.status === "active"
                    ? "info"
                    : wishJar.status === "verified"
                      ? "success"
                      : "error"
                }
                size="md"
              >
                {wishJar.status}
              </Badge>
            </div>

            {/* Creator Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Avatar
                src={wishJar.ownerId.avatarUrl}
                alt={wishJar.ownerId.displayName || "Creator"}
                fallback={wishJar.ownerId.displayName?.[0] || "U"}
                size="lg"
              />
              <div className="flex-1">
                <p className="font-medium text-h5">
                  {wishJar.ownerId.displayName ||
                    wishJar.ownerId.walletAddress.slice(0, 6) + "..."}
                </p>
                <p className="text-sm text-gray-500">
                  Created • Deadline:{" "}
                  {new Date(wishJar.deadline).toLocaleDateString()}
                </p>
              </div>
              <FollowButton userId={wishJar.ownerId.walletAddress} />
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1">
            <h2 className="text-h3 font-bold mb-4">Progress Timeline</h2>
            <Milestones wishId={wishJar._id} />
          </div>

          {/* Updates Feed */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1">
            <h2 className="text-h3 font-bold mb-4">Updates Feed</h2>
            <Comments wishId={wishJar._id} />
          </div>

          {/* Media Gallery */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1">
            <h2 className="text-h3 font-bold mb-4">Media Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wishJar.proofs?.map((proof) => (
                <div key={proof._id} className="aspect-square">
                  <OptimizedImage
                    src={proof.mediaURI}
                    alt={proof.caption || "Proof"}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )) || (
                <p className="text-gray-500 col-span-full text-center py-8">
                  No media uploaded yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 360px sidebar */}
        <div className="lg:w-[360px] space-y-6">
          {/* Pledge Summary */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1 sticky top-4">
            <h3 className="text-h4 font-bold mb-4">Pledge Summary</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold text-dream-blue mb-1">
                {(wishJar.pledgedAmount / 1000000000).toFixed(2)} TON
              </div>
              <div className="text-sm text-gray-500 mb-3">
                of {(wishJar.stakeAmount / 1000000000).toFixed(2)} TON goal
              </div>
              <ProgressBar progress={progress} className="mb-2" />
              <div className="text-xs text-gray-500">
                {wishJar.pledges.length} supporters
              </div>
            </div>

            {/* Action CTA */}
            <div className="space-y-3">
              {canPledge && (
                <Button
                  onClick={() => setShowPledgeModal(true)}
                  className="w-full"
                  size="lg"
                >
                  💰 Pledge Support
                </Button>
              )}

              {isOwner && wishJar.status === "active" && (
                <Button
                  variant="secondary"
                  onClick={() => setShowProofModal(true)}
                  className="w-full"
                  size="lg"
                >
                  📸 Post Update
                </Button>
              )}

              <ShareButton
                url={`/wish/${wishJar._id}`}
                title={wishJar.title}
                className="w-full"
              />
            </div>
          </div>

          {/* Supporters List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1">
            <h3 className="text-h4 font-bold mb-4">
              Supporters ({wishJar.pledges.length})
            </h3>
            {wishJar.pledges.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No supporters yet
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {wishJar.pledges.map((pledge) => (
                  <div
                    key={pledge._id}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={pledge.supporterId.avatarUrl}
                        alt={pledge.supporterId.displayName || "Supporter"}
                        fallback={pledge.supporterId.displayName?.[0] || "S"}
                        size="sm"
                      />
                      <span className="text-sm font-medium">
                        {pledge.supporterId.displayName ||
                          pledge.supporterId.walletAddress.slice(0, 6) + "..."}
                      </span>
                    </div>
                    <span className="font-medium text-sm text-dream-blue">
                      {(pledge.amount / 1000000000).toFixed(2)} TON
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Wishes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1">
            <h3 className="text-h4 font-bold mb-4">Related Wishes</h3>
            <p className="text-gray-500 text-center py-4">No related wishes</p>
          </div>
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
        onClose={() => {
          setShowProofModal(false);
          setProofFile(null);
          setProofCaption("");
          setUploadProgress(0);
        }}
        title="Post Progress Proof"
      >
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              proofFile
                ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-primary"
            }`}
          >
            {proofFile ? (
              <div className="space-y-3">
                <div className="text-green-600 dark:text-green-400">
                  <span className="text-2xl">✅</span>
                  <p className="font-medium">File selected: {proofFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {proofFile.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(proofFile)}
                    alt="Preview"
                    className="max-w-full max-h-32 mx-auto rounded"
                  />
                )}
                <button
                  onClick={() => setProofFile(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your proof file here, or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="proof-file-input"
                />
                <label
                  htmlFor="proof-file-input"
                  className="inline-block bg-primary text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition"
                >
                  Choose File
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supports images and videos up to 50MB
                </p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Caption (Optional)
            </label>
            <textarea
              placeholder="Describe your progress..."
              value={proofCaption}
              onChange={(e) => setProofCaption(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {proofCaption.length}/500
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowProofModal(false);
                setProofFile(null);
                setProofCaption("");
                setUploadProgress(0);
              }}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handlePostProof}
              disabled={!proofFile || uploading}
              className="flex-1 bg-success text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Post Proof
                </>
              )}
            </button>
          </div>
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
