import { useAuth } from "../contexts/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Please connect your wallet first.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Wallet Address
          </label>
          <p className="text-gray-600 dark:text-gray-400">
            {user.walletAddress}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            type="text"
            value={user.displayName || ""}
            className="w-full p-2 border rounded dark:bg-gray-700"
            placeholder="Enter display name"
          />
        </div>
        <button
          onClick={logout}
          className="bg-danger text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
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
