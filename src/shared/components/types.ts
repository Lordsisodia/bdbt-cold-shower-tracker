import { VariantProps } from 'class-variance-authority';

// Base component props that all components can extend
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Common variant props shared across components
export interface CommonVariantProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline';
}

// Props for components that can have different states
export interface StateProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  isActive?: boolean;
  isSelected?: boolean;
}

// Props for interactive components
export interface InteractiveProps {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}

// Props for components with icons
export interface IconProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Props for form elements
export interface FormControlProps extends BaseComponentProps {
  id?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
}

// Props for layout components
export interface LayoutProps extends BaseComponentProps {
  spacing?: number | string;
  padding?: number | string;
  margin?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}