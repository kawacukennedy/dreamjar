import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "nft";
  size?: "sm" | "md" | "lg";
  className?: string;
  nftImage?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    primary: "bg-dream-blue text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-error text-white",
    info: "bg-info text-white",
    nft: "bg-gradient-to-r from-violet to-mint text-white border-2 border-white/20",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {variant === "nft" && nftImage && (
        <img src={nftImage} alt="NFT" className="w-4 h-4 mr-1 rounded" />
      )}
      {children}
    </span>
  );
};

export default Badge;
