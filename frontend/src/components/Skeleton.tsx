interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width = "100%",
  height = "1rem",
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-600 rounded ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
