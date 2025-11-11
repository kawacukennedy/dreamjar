import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");

  if (!user) {
    return <div>Please connect your wallet first.</div>;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // TODO: Save profile to backend
    addToast("Profile updated successfully!", "success");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <div className="relative">
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              📷
            </label>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">
              {displayName || "Anonymous"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Wallet Address
            </label>
            <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              {user.walletAddress}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            >
              Save Changes
            </button>
            <button
              onClick={logout}
              className="bg-danger text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">My Dreams</h3>
        {/* TODO: List user's wish jars */}
        <p className="text-gray-500">No dreams created yet.</p>
      </div>
    </div>
  );
}

export default Profile;
