import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";

interface WishJar {
  _id: string;
  title: string;
  status: string;
  pledgedAmount: number;
  stakeAmount: number;
}

interface FollowData {
  followers: number;
  following: number;
  isFollowing: boolean;
}

function Profile() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [displayName] = useState(user?.displayName || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [userWishJars, setUserWishJars] = useState<WishJar[]>([]);
  const [loading, setLoading] = useState(true);
  const [followData, setFollowData] = useState<FollowData>({
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [followLoading, setFollowLoading] = useState(false);

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
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch follow data
        const [followersRes, followingRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/auth/followers`, {
            headers: { Authorization: `Bearer ${token || ""}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/auth/following`, {
            headers: { Authorization: `Bearer ${token || ""}` },
          }),
        ]);

        let followersCount = 0;
        let followingCount = 0;

        if (followersRes.ok) {
          const followersData = await followersRes.json();
          followersCount = followersData.count;
        }

        if (followingRes.ok) {
          const followingData = await followingRes.json();
          followingCount = followingData.count;
        }

        setFollowData({
          followers: followersCount,
          following: followingCount,
          isFollowing: false, // Can't follow yourself
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wish/my`,
          {
            headers: {
              Authorization: `Bearer ${token || ""}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setUserWishJars(data.wishes || data);
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
        console.error("Failed to fetch user data:", error);
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

    fetchUserData();
  }, [user, token]);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ displayName }),
        },
      );

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold">
              {displayName || "Anonymous"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </p>
            <div className="flex space-x-4 mt-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-gray-100">
                  {followData.followers}
                </strong>{" "}
                followers
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-gray-100">
                  {followData.following}
                </strong>{" "}
                following
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleSave}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            Save Profile
          </button>
          <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200">
            Share Profile
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: "🏆",
              title: "First Dream",
              desc: "Created your first dream",
              unlocked: userWishJars.length > 0,
              progress: userWishJars.length,
              max: 1,
            },
            {
              icon: "💰",
              title: "Generous Supporter",
              desc: "Pledged to 5+ dreams",
              unlocked: false, // Would need pledge data
              progress: 0,
              max: 5,
            },
            {
              icon: "🎯",
              title: "Dream Achiever",
              desc: "Completed a dream",
              unlocked: userWishJars.some(
                (j) => j.status === "ResolvedSuccess",
              ),
              progress: userWishJars.filter(
                (j) => j.status === "ResolvedSuccess",
              ).length,
              max: 1,
            },
            {
              icon: "🌟",
              title: "Community Hero",
              desc: "Helped 10+ dreams succeed",
              unlocked: false, // Would need more complex logic
              progress: 0,
              max: 10,
            },
            {
              icon: "🔥",
              title: "Streak Master",
              desc: "Maintained a dream for 30 days",
              unlocked: userWishJars.some((j) => {
                const created = new Date(j.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - created.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 30;
              }),
              progress: 0,
              max: 30,
            },
            {
              icon: "🎨",
              title: "Creative Mind",
              desc: "Created dreams in 3+ categories",
              unlocked:
                new Set(userWishJars.map((j) => j.category).filter(Boolean))
                  .size >= 3,
              progress: new Set(
                userWishJars.map((j) => j.category).filter(Boolean),
              ).size,
              max: 3,
            },
            {
              icon: "📈",
              title: "Fundraiser",
              desc: "Raised 100+ TON total",
              unlocked:
                userWishJars.reduce((sum, j) => sum + j.pledgedAmount, 0) >=
                100000000000,
              progress: Math.floor(
                userWishJars.reduce((sum, j) => sum + j.pledgedAmount, 0) /
                  1000000000,
              ),
              max: 100,
            },
            {
              icon: "👑",
              title: "Dream Leader",
              desc: "Top 10 on leaderboard",
              unlocked: false, // Would need leaderboard position
              progress: 0,
              max: 10,
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center transition-all duration-200 ${
                achievement.unlocked ? "ring-2 ring-primary" : "opacity-60"
              }`}
            >
              <div
                className={`text-3xl mb-2 ${achievement.unlocked ? "" : "grayscale"}`}
              >
                {achievement.icon}
              </div>
              <h4 className="font-bold mb-1">{achievement.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {achievement.desc}
              </p>
              {!achievement.unlocked && achievement.max > 1 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(achievement.progress / achievement.max) * 100}%`,
                    }}
                  />
                </div>
              )}
              {achievement.unlocked && (
                <Badge variant="success" size="sm">
                  Unlocked
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Analytics Dashboard</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold text-primary">
              {userWishJars.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Dreams
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold text-green-500">
              {
                userWishJars.filter((j) => j.status === "ResolvedSuccess")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Successful
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold text-blue-500">
              {(
                userWishJars.reduce((sum, j) => sum + j.pledgedAmount, 0) /
                1000000000
              ).toFixed(1)}{" "}
              TON
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Raised
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-2xl font-bold text-purple-500">
              {userWishJars.length > 0
                ? Math.round(
                    (userWishJars.filter((j) => j.status === "ResolvedSuccess")
                      .length /
                      userWishJars.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Success Rate
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h4 className="font-bold mb-4">Dream Progress</h4>
          <div className="space-y-4">
            {userWishJars.slice(0, 3).map((jar) => {
              const progress = (jar.pledgedAmount / jar.stakeAmount) * 100;
              return (
                <div key={jar._id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{jar.title}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar progress={progress} className="mb-2" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>
                      {(jar.pledgedAmount / 1000000000).toFixed(1)} TON raised
                    </span>
                    <span>
                      {(jar.stakeAmount / 1000000000).toFixed(1)} TON goal
                    </span>
                  </div>
                </div>
              );
            })}
            {userWishJars.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No dreams created yet
              </p>
            )}
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
                      Pledged: {jar.pledgedAmount / 1000000000} TON / Goal:{" "}
                      {jar.stakeAmount / 1000000000} TON
                    </p>
                  </div>
                  <Badge
                    variant={
                      jar.status === "Active"
                        ? "info"
                        : jar.status === "ResolvedSuccess"
                          ? "success"
                          : "danger"
                    }
                    size="sm"
                  >
                    {jar.status}
                  </Badge>
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
