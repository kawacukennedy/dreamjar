import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import ProgressBar from "./ProgressBar";

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number; // in TON
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

interface MilestonesProps {
  wishId: string;
  currentPledged: number;
  totalGoal: number;
}

const Milestones: React.FC<MilestonesProps> = ({
  wishId,
  currentPledged,
  totalGoal,
}) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "First Supporter",
      description: "Get your first pledge",
      targetAmount: 1,
      completed: currentPledged > 0,
      completedAt: currentPledged > 0 ? new Date() : undefined,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Quarter Way",
      description: "Reach 25% of your goal",
      targetAmount: totalGoal * 0.25,
      completed: currentPledged >= totalGoal * 0.25,
      completedAt: currentPledged >= totalGoal * 0.25 ? new Date() : undefined,
      createdAt: new Date(),
    },
    {
      id: "3",
      title: "Half Way There",
      description: "Reach 50% of your goal",
      targetAmount: totalGoal * 0.5,
      completed: currentPledged >= totalGoal * 0.5,
      completedAt: currentPledged >= totalGoal * 0.5 ? new Date() : undefined,
      createdAt: new Date(),
    },
    {
      id: "4",
      title: "Three Quarters",
      description: "Reach 75% of your goal",
      targetAmount: totalGoal * 0.75,
      completed: currentPledged >= totalGoal * 0.75,
      completedAt: currentPledged >= totalGoal * 0.75 ? new Date() : undefined,
      createdAt: new Date(),
    },
    {
      id: "5",
      title: "Goal Achieved!",
      description: "Reach 100% of your goal",
      targetAmount: totalGoal,
      completed: currentPledged >= totalGoal,
      completedAt: currentPledged >= totalGoal ? new Date() : undefined,
      createdAt: new Date(),
    },
  ]);

  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    targetAmount: "",
  });

  const handleAddMilestone = async () => {
    if (!token || !newMilestone.title.trim() || !newMilestone.targetAmount)
      return;

    try {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim(),
        targetAmount: parseFloat(newMilestone.targetAmount) * 1000000000, // Convert to nanotons
        completed: false,
        createdAt: new Date(),
      };

      setMilestones((prev) => [...prev, milestone]);
      setNewMilestone({ title: "", description: "", targetAmount: "" });
      setShowAddMilestone(false);
      addToast("Milestone added!", "success");
    } catch (error) {
      addToast("Failed to add milestone", "error");
    }
  };

  const progressPercentage = (currentPledged / totalGoal) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      <ProgressBar progress={progressPercentage} showLabel />

      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const milestoneProgress = Math.min(
            (currentPledged / milestone.targetAmount) * 100,
            100,
          );

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                milestone.completed
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : milestoneProgress >= 100
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">
                      {milestone.completed
                        ? "✅"
                        : milestoneProgress >= 100
                          ? "🎯"
                          : "⏳"}
                    </span>
                    <h4
                      className={`font-medium ${milestone.completed ? "line-through text-gray-500" : ""}`}
                    >
                      {milestone.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {milestone.description}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Target: {(milestone.targetAmount / 1000000000).toFixed(1)}{" "}
                      TON
                    </span>
                    <span>Progress: {milestoneProgress.toFixed(1)}%</span>
                  </div>
                  <ProgressBar progress={milestoneProgress} className="mt-2" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {user && (
        <div className="mt-6">
          {!showAddMilestone ? (
            <button
              onClick={() => setShowAddMilestone(true)}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors duration-200"
            >
              + Add Custom Milestone
            </button>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Add New Milestone</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newMilestone.description}
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Target amount (TON)"
                    value={newMilestone.targetAmount}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        targetAmount: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                    step="0.1"
                    min="0.1"
                  />
                  <button
                    onClick={handleAddMilestone}
                    disabled={
                      !newMilestone.title.trim() || !newMilestone.targetAmount
                    }
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddMilestone(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Milestones;
