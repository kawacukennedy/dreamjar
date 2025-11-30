import { ReactNode, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-dream-blue text-white hover:bg-dream-blue/90",
        secondary: "bg-violet text-white hover:bg-violet/90",
        ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        danger: "bg-error text-white hover:bg-error/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
}

export const Button = ({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {children}
    </button>
  );
};

// Import LoadingSpinner if needed, or define inline
const LoadingSpinner = ({ className }: { className?: string }) => (
  <div
    className={`animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 ${className}`}
  />
);
