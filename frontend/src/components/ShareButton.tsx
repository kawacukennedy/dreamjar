import { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import Modal from "./Modal";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const shareUrl = `${window.location.origin}${url}`;
  const shareText = description
    ? `${title} - ${description}`
    : `Check out this dream: ${title}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast("Link copied to clipboard!", "success");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to copy:", err);
      addToast("Failed to copy link", "error");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        setShowModal(false);
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const shareToPlatform = (platform: string) => {
    let shareLink = "";

    switch (platform) {
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=DreamJar,TON`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "reddit":
        shareLink = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
      setShowModal(false);
    }
  };

  const platforms = [
    {
      id: "telegram",
      name: "Telegram",
      icon: "📱",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: "🐦",
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "📘",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "💼",
      color: "bg-blue-700 hover:bg-blue-800",
    },
    {
      id: "reddit",
      name: "Reddit",
      icon: "🟠",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "💬",
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-3 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label="Share this dream"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        Share
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Share Dream"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-semibold text-lg mb-2">{title}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Share this dream with your network!
            </p>
          </div>

          {/* Native Share API */}
          {navigator.share && (
            <button
              onClick={shareNative}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share via Device
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Link
          </button>

          {/* Social Platforms */}
          <div>
            <h5 className="font-medium mb-3 text-center">
              Share on Social Media
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => shareToPlatform(platform.id)}
                  className={`flex items-center justify-center px-3 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 ${platform.color}`}
                >
                  <span className="text-lg mr-2">{platform.icon}</span>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* URL Display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Share URL:
            </p>
            <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
              {shareUrl}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareButton;
