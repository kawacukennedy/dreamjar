import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "./LoadingSpinner";

interface Comment {
  _id: string;
  userId: {
    _id: string;
    displayName?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

interface CommentsProps {
  wishId: string;
}

const Comments: React.FC<CommentsProps> = ({ wishId }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [wishId]);

  const fetchComments = async () => {
    try {
      // Mock data for now
      const mockComments: Comment[] = [
        {
          _id: "1",
          userId: {
            _id: "user1",
            displayName: "Alex Chen",
            walletAddress: "0x123...",
            avatarUrl: "/avatar1.png",
          },
          content:
            "This is such an inspiring dream! I'm pledging 10 TON to help you achieve it. Keep pushing! 🚀",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes: 5,
          likedBy: ["user2", "user3"],
        },
        {
          _id: "2",
          userId: {
            _id: "user2",
            displayName: "Sarah Kim",
            walletAddress: "0x456...",
          },
          content:
            "Love the goal! What's your training plan? I'd love to follow your progress.",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          likes: 2,
          likedBy: ["user1"],
        },
      ];
      setComments(mockComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim()) return;

    setSubmitting(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const comment: Comment = {
        _id: Date.now().toString(),
        userId: {
          _id: user!._id,
          displayName: user!.displayName,
          walletAddress: user!.walletAddress,
        },
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      };

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      addToast("Comment posted!", "success");
    } catch (error) {
      addToast("Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = comments.find((c) => c._id === commentId);
      if (!comment) return;

      const isLiked = comment.likedBy.includes(user._id);
      const newLikes = isLiked ? comment.likes - 1 : comment.likes + 1;
      const newLikedBy = isLiked
        ? comment.likedBy.filter((id) => id !== user._id)
        : [...comment.likedBy, user._id];

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likes: newLikes, likedBy: newLikedBy }
            : c,
        ),
      );
    } catch (error) {
      addToast("Failed to like comment", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex space-x-3">
            <img
              src={user.avatarUrl || "/default-avatar.png"}
              alt="Your avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this dream..."
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex space-x-3">
                <img
                  src={comment.userId.avatarUrl || "/default-avatar.png"}
                  alt={`${comment.userId.displayName || "User"}'s avatar`}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {comment.userId.displayName ||
                        comment.userId.walletAddress.slice(0, 6) + "..."}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center space-x-1 text-sm transition-colors duration-200 ${
                        user && comment.likedBy.includes(user._id)
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
