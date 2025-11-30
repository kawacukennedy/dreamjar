import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAnalytics } from "../hooks/useAnalytics";
import DataTable from "../components/DataTable";
import BarChart from "../components/BarChart";
import Button from "../components/Button";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { token } = useAuth();
  const { trackPageView } = useAnalytics();

  // Mock data - in real app, fetch from API
  const overviewData = {
    totalWishes: 1250,
    activeWishes: 890,
    totalPledges: 4560,
    totalVolume: 125000, // in TON
  };

  const disputes = [
    {
      id: "1",
      wishId: "wish-123",
      reason: "Proof disputed",
      status: "pending",
    },
    {
      id: "2",
      wishId: "wish-456",
      reason: "Deadline missed",
      status: "resolved",
    },
  ];

  const contracts = [
    { address: "EQC...", status: "active", wishes: 5 },
    { address: "EQD...", status: "resolved", wishes: 2 },
  ];

  const analyticsData = [
    { month: "Jan", wishes: 120, pledges: 450 },
    { month: "Feb", wishes: 150, pledges: 520 },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "disputes", label: "Disputes" },
    { id: "contracts", label: "Contracts" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        <div className="mb-6">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Wishes
              </h3>
              <p className="text-3xl font-bold text-primary">
                {overviewData.totalWishes}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                Active Wishes
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {overviewData.activeWishes}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Pledges
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {overviewData.totalPledges}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Volume
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {overviewData.totalVolume} TON
              </p>
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Dispute Queue</h2>
              <DataTable
                columns={[
                  { key: "id", label: "ID" },
                  { key: "wishId", label: "Wish ID" },
                  { key: "reason", label: "Reason" },
                  { key: "status", label: "Status" },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                      <Button size="sm" disabled={row.status === "resolved"}>
                        Resolve
                      </Button>
                    ),
                  },
                ]}
                data={disputes}
              />
            </div>
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Contract Monitoring
              </h2>
              <DataTable
                columns={[
                  { key: "address", label: "Address" },
                  { key: "status", label: "Status" },
                  { key: "wishes", label: "Wishes" },
                ]}
                data={contracts}
              />
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <BarChart data={analyticsData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
