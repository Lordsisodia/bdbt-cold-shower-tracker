import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import type { BaseComponentProps, LayoutProps } from '../types';
import { cn } from '../utils';

const stackVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        column: "flex-col",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
      },
      spacing: {
        0: "gap-0",
        1: "gap-1",
        2: "gap-2",
        3: "gap-3",
        4: "gap-4",
        5: "gap-5",
        6: "gap-6",
        8: "gap-8",
      },
      wrap: {
        true: "flex-wrap",
        false: "flex-nowrap",
      }
    },
    defaultVariants: {
      direction: "column",
      align: "stretch",
      justify: "start",
      spacing: 4,
      wrap: false,
    },
  }
);

interface StackProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants>,
    BaseComponentProps,
    LayoutProps {
  as?: React.ElementType;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(({
  direction,
  align,
  justify,
  spacing,
  wrap,
  children,
  className,
  as: Component = 'div',
  ...props
}, ref) => {
  return (
    <Component 
      ref={ref}
      className={cn(stackVariants({ direction, align, justify, spacing, wrap }), className)} 
      {...props}
    >
      {children}
    </Component>
  );
});