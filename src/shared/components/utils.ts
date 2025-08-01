import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate data-testid attributes
export function getTestId(componentName: string, variant?: string): string {
  return variant ? `${componentName}-${variant}` : componentName;
}

// Function to generate ARIA labels
export function getAriaLabel(componentName: string, props: Record<string, any>): string {
  const { label, ariaLabel, children } = props;
  return ariaLabel || label || (typeof children === 'string' ? children : '') || componentName;
}

// Type guard for checking if a value is a valid React node
export function isValidReactNode(node: unknown): node is React.ReactNode {
  return node !== undefined && node !== null && node !== false;
}

// Function to filter out invalid React nodes from children
export function filterValidChildren(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).filter(isValidReactNode);
}