import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva(
  "rounded-xl border transition-all duration-200 hover:scale-[1.02]",
  {
    variants: {
      variant: {
        glass: "bg-white/90 backdrop-blur-md border-blue-100/50",
        solid: "bg-white border-gray-200",
        gradient: "bg-gradient-to-br from-blue-50/80 to-teal-50/80 border-blue-100/50 backdrop-blur-sm",
        glow: "bg-white/95 backdrop-blur-md border-blue-200 shadow-blue-100/20",
      },
      padding: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      shadow: {
        none: "",
        sm: "shadow-sm hover:shadow-md",
        md: "shadow-md hover:shadow-lg",
        lg: "shadow-lg hover:shadow-xl",
        xl: "shadow-xl hover:shadow-2xl",
      },
    },
    defaultVariants: {
      variant: "glass",
      padding: "md",
      shadow: "md",
    },
  }
);

interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant,
  padding,
  shadow,
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(cardVariants({ variant, padding, shadow }), className)} 
      {...props}
    >
      {children}
    </div>
  );
};