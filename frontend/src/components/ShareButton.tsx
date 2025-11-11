import { useState } from "react";
import Modal from "./Modal";

interface ShareButtonProps {
  url: string;
  title: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ url, title }) => {
  const [showModal, setShowModal] = useState(false);

  const shareUrl = `${window.location.origin}${url}`;
  const shareText = `Check out this dream: ${title}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, "_blank");
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-accent text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        aria-label="Share this dream"
      >
        Share
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Share Dream"
      >
        <div className="space-y-4">
          <p>Share this dream with others!</p>
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-gray-200 dark:bg-gray-700 p-3 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              📋 Copy Link
            </button>
            <button
              onClick={shareToTelegram}
              className="flex-1 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
            >
              📱 Telegram
            </button>
            <button
              onClick={shareToTwitter}
              className="flex-1 bg-blue-400 text-white p-3 rounded hover:bg-blue-500 transition"
            >
              🐦 Twitter
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareButton;
