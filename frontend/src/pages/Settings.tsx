import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";

function Settings() {
  const { user, token } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    pledgeAlerts: true,
    voteAlerts: true,
    resolutionAlerts: true,
    language: "en",
    currency: "TON",
    privacy: "public",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In real app, save to backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call
      addToast("Settings saved successfully!", "success");
    } catch (error) {
      addToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      user,
      settings,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dreamjar-data-${user?.walletAddress?.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast("Data exported successfully!", "success");
  };

  if (!user) {
    return <div>Please connect your wallet first.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-8">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dark Mode</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Toggle between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isDark ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isDark ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-2">Theme Color</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Default", value: "default" },
                  { name: "Blue", value: "blue" },
                  { name: "Green", value: "green" },
                  { name: "Purple", value: "purple" },
                ].map(({ name, value }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      theme === value
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-full h-4 rounded ${
                        value === "default"
                          ? "bg-gradient-to-r from-purple-500 to-blue-500"
                          : value === "blue"
                            ? "bg-blue-500"
                            : value === "green"
                              ? "bg-green-500"
                              : "bg-purple-500"
                      }`}
                    />
                    <p className="text-sm mt-2">{name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Email Notifications",
                desc: "Receive email updates about your dreams",
              },
              {
                key: "pushNotifications",
                label: "Push Notifications",
                desc: "Receive browser push notifications",
              },
              {
                key: "pledgeAlerts",
                label: "Pledge Alerts",
                desc: "Get notified when someone pledges to your dreams",
              },
              {
                key: "voteAlerts",
                label: "Vote Alerts",
                desc: "Get notified about votes on your proofs",
              },
              {
                key: "resolutionAlerts",
                label: "Resolution Alerts",
                desc: "Get notified when dreams are resolved",
              },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="font-medium">{label}</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {desc}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      key,
                      !settings[key as keyof typeof settings],
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings[key as keyof typeof settings]
                      ? "bg-primary"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      settings[key as keyof typeof settings]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  handleSettingChange("currency", e.target.value)
                }
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="TON">TON</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium mb-2">Privacy</label>
              <select
                value={settings.privacy}
                onChange={(e) => handleSettingChange("privacy", e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="public">
                  Public - Anyone can see my dreams
                </option>
                <option value="friends">
                  Friends Only - Limited visibility
                </option>
                <option value="private">
                  Private - Only I can see my dreams
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Account</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm">
                  {user.walletAddress}
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(user.walletAddress)
                  }
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                Export Data
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <LoadingSpinner size="sm" color="white" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
