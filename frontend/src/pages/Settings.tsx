import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAnalytics } from "../hooks/useAnalytics";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";

function Settings() {
  const { user, token } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const { trackEvent } = useAnalytics();

  const [activeTab, setActiveTab] = useState<
    "appearance" | "notifications" | "privacy" | "account"
  >("appearance");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    pledgeAlerts: true,
    voteAlerts: true,
    resolutionAlerts: true,
    followAlerts: true,
    commentAlerts: true,
    marketingEmails: false,
    language: "en",
    currency: "TON",
    privacy: "public",
    twoFactorEnabled: false,
    sessionTimeout: 30, // minutes
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

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
      trackEvent("settings_updated", { tab: activeTab });
      addToast("Settings saved successfully!", "success");
    } catch (error) {
      addToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Mock data export - in real app, fetch from backend
      const data = {
        user,
        settings,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };
      setExportData(data);
      setShowExportModal(true);
    } catch (error) {
      addToast("Failed to prepare export data", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadExportData = () => {
    if (!exportData) return;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
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

    trackEvent("data_exported");
    addToast("Data exported successfully!", "success");
    setShowExportModal(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // In real app, call delete API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      trackEvent("account_deleted");
      addToast(
        "Account deletion initiated. You will receive a confirmation email.",
        "warning",
      );
      setShowDeleteModal(false);
    } catch (error) {
      addToast("Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please connect your wallet first.</div>;
  }

  const tabs = [
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "account", label: "Account", icon: "👤" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <div className="space-y-6">
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
                aria-label="Toggle dark mode"
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
                    aria-label={`Select ${name} theme`}
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
        );

      case "notifications":
        return (
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
              {
                key: "followAlerts",
                label: "Follow Alerts",
                desc: "Get notified when someone follows you",
              },
              {
                key: "commentAlerts",
                label: "Comment Alerts",
                desc: "Get notified about comments on your dreams",
              },
              {
                key: "marketingEmails",
                label: "Marketing Emails",
                desc: "Receive promotional emails and updates",
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
                  aria-label={`Toggle ${label}`}
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
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">
                Profile Visibility
              </label>
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

            <div>
              <label className="block font-medium mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    "sessionTimeout",
                    parseInt(e.target.value),
                  )
                }
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={240}>4 hours</option>
                <option value={0}>Never</option>
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Automatically log out after this period of inactivity
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Two-Factor Authentication</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "twoFactorEnabled",
                    !settings.twoFactorEnabled,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.twoFactorEnabled
                    ? "bg-primary"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                aria-label="Toggle two-factor authentication"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.twoFactorEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm break-all">
                  {user.walletAddress}
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(user.walletAddress)
                  }
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                  title="Copy to clipboard"
                  aria-label="Copy wallet address"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">
                Danger Zone
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h5 className="font-medium">Export Data</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download a copy of your data
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                  >
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <h5 className="font-medium text-red-600 dark:text-red-400">
                      Delete Account
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              aria-selected={activeTab === tab.id}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-6 capitalize">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </h3>
        {renderTabContent()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading && <LoadingSpinner size="sm" color="white" />}
          <span>Save Settings</span>
        </button>
      </div>

      {/* Export Data Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Your Data"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Your data export is ready. This includes your profile information,
              dreams, pledges, and other activity data.
            </p>
            {exportData && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Export Summary</h4>
                <div className="text-sm space-y-1">
                  <p>
                    Export Date:{" "}
                    {new Date(exportData.exportDate).toLocaleDateString()}
                  </p>
                  <p>Version: {exportData.version}</p>
                  <p>User: {exportData.user.walletAddress?.slice(0, 8)}...</p>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={downloadExportData}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
              >
                Download
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-xl">
                    ⚠️
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Are you absolutely sure?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </p>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                Please type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                className="mt-2 w-full p-2 border border-red-300 dark:border-red-600 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type DELETE to confirm"
                onChange={(e) => {
                  // In real app, validate the input
                }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Settings;
