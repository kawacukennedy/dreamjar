import { useState } from "react";
import { Button } from "../components/Button";
import { DataTable } from "../components/DataTable";
import { BarChart } from "../components/BarChart";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "disputes" | "contracts" | "analytics"
  >("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
                <h3 className="text-lg font-semibold">Total Wishes</h3>
                <p className="text-2xl font-bold text-dream-blue">1,234</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
                <h3 className="text-lg font-semibold">Active Contracts</h3>
                <p className="text-2xl font-bold text-success">567</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
                <h3 className="text-lg font-semibold">Pending Disputes</h3>
                <p className="text-2xl font-bold text-warning">12</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
                <h3 className="text-lg font-semibold">Impact Pool</h3>
                <p className="text-2xl font-bold text-mint">89.5 TON</p>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <BarChart data={[]} />
            </div>
          </div>
        );

      case "disputes":
        return (
          <div className="space-y-6">
            <h2 className="text-h2 font-bold">Dispute Resolution</h2>
            <DataTable
              columns={[
                { key: "id", label: "ID" },
                { key: "wish", label: "Wish" },
                { key: "reason", label: "Reason" },
                { key: "status", label: "Status" },
                { key: "actions", label: "Actions" },
              ]}
              data={[]} // Mock data
            />
          </div>
        );

      case "contracts":
        return (
          <div className="space-y-6">
            <h2 className="text-h2 font-bold">Contract Monitoring</h2>
            <DataTable
              columns={[
                { key: "address", label: "Contract Address" },
                { key: "status", label: "Status" },
                { key: "balance", label: "Balance" },
                { key: "lastActivity", label: "Last Activity" },
              ]}
              data={[]} // Mock data
            />
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-h2 font-bold">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
                <h3 className="text-lg font-semibold mb-4">User Retention</h3>
                <BarChart data={[]} />
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-level1">
                <h3 className="text-lg font-semibold mb-4">
                  Transaction Volume
                </h3>
                <BarChart data={[]} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-h1 font-bold">Admin Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Monitor and manage the DreamJar platform
        </p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "disputes", label: "Disputes" },
            { id: "contracts", label: "Contracts" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2"
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>

      {renderTab()}
    </div>
  );
}
