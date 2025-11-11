import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Link } from "react-router-dom";

interface WishJar {
  _id: string;
  title: string;
  status: string;
  pledgedAmount: number;
  stakeAmount: number;
}

function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [userWishJars, setUserWishJars] = useState<WishJar[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchUserWishJars = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/wish/user/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          setUserWishJars(data);
        } else {
          // Fallback to mock data
          setUserWishJars([
            {
              _id: "1",
              title: "Run Marathon",
              status: "Active",
              pledgedAmount: 500000000,
              stakeAmount: 1000000000,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch user wish jars:", error);
        // Fallback
        setUserWishJars([
          {
            _id: "1",
            title: "Run Marathon",
            status: "Active",
            pledgedAmount: 500000000,
            stakeAmount: 1000000000,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserWishJars();
  }, [user]);

  const handleSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ displayName }),
      });

      if (response.ok) {
        addToast("Profile updated successfully!", "success");
      } else {
        addToast("Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      addToast("Failed to update profile", "error");
    }
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

        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Save Profile
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center ${userWishJars.length > 0 ? '' : 'opacity-50'}`}>
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-bold">First Dream</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Created your first dream</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center opacity-50">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold">Top Supporter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pledged the most</p>
            </div>
            <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center ${userWishJars.some(j => j.status === 'ResolvedSuccess') ? '' : 'opacity-50'}`}>
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
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : userWishJars.length > 0 ? (
          <div className="space-y-4">
            {userWishJars.map((jar) => (
              <div
                key={jar._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/wish/${jar._id}`}
                      className="text-lg font-semibold hover:text-primary"
                    >
                      {jar.title}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pledged: {jar.pledgedAmount / 1000000000} TON / Goal: {jar.stakeAmount / 1000000000} TON
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      jar.status === "Active"
                        ? "bg-accent text-white"
                        : jar.status === "ResolvedSuccess"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                    }`}
                  >
                    {jar.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No dreams created yet.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
