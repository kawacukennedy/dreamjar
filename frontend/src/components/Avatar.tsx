import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        "24": "h-6 w-6",
        "32": "h-8 w-8",
        "48": "h-12 w-12",
        "72": "h-18 w-18",
      },
    },
    defaultVariants: {
      size: "48",
    },
  },
);

interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    return (
      <div ref={ref} className={avatarVariants({ size, className })} {...props}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {fallback || "?"}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
