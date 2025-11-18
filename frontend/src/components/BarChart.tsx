import React from "react";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  className?: string;
  height?: number;
  showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  className = "",
  height = 200,
  showValues = true,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const barHeight = (percentage / 100) * height;

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {showValues && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  {item.value}
                </div>
              )}
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  item.color || "bg-primary"
                }`}
                style={{ height: `${barHeight}px`, minHeight: "4px" }}
                title={`${item.label}: ${item.value}`}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
