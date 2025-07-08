import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-800 border border-blue-200",
        secondary: "bg-gray-100 text-gray-800 border border-gray-200",
        success: "bg-green-100 text-green-800 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        purple: "bg-purple-100 text-purple-800 border border-purple-200",
        indigo: "bg-indigo-100 text-indigo-800 border border-indigo-200",
        pink: "bg-pink-100 text-pink-800 border border-pink-200",
        gold: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md",
        silver: "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-md",
        bronze: "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size,
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
};