import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");

  if (!user) {
    return <div>Please connect your wallet first.</div>;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

       <div className="mt-8">
         <h3 className="text-xl font-bold mb-4">Achievements</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
             <div className="text-3xl mb-2">🏆</div>
             <h4 className="font-bold">First Dream</h4>
             <p className="text-sm text-gray-600 dark:text-gray-400">Created your first dream</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
             <div className="text-3xl mb-2">💰</div>
             <h4 className="font-bold">Top Supporter</h4>
             <p className="text-sm text-gray-600 dark:text-gray-400">Pledged the most</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center opacity-50">
             <div className="text-3xl mb-2">🎯</div>
             <h4 className="font-bold">Dream Achiever</h4>
             <p className="text-sm text-gray-600 dark:text-gray-400">Completed a dream</p>
           </div>
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center opacity-50">
             <div className="text-3xl mb-2">🌟</div>
             <h4 className="font-bold">Community Hero</h4>
             <p className="text-sm text-gray-600 dark:text-gray-400">Helped 10+ dreams</p>
           </div>
         </div>
       </div>

       <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Dream Progress</h3>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Run Marathon</span>
                <span>50%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "50%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Learn Guitar</span>
                <span>80%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: "80%" }}
                ></div>
              </div>
            </div>
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
