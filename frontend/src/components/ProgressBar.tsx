interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${clampedProgress}%`}
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}
    >
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
