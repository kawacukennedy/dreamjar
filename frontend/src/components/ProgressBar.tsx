import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  color?: "primary" | "success" | "warning" | "danger";
  animated?: boolean;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
  color = "primary",
  animated = true,
  showLabel = false,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${clampedProgress}%`}
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner"
      >
        <div
          className={`${colorClasses[color]} h-3 rounded-full transition-all duration-500 ease-out ${
            animated ? "animate-pulse" : ""
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
