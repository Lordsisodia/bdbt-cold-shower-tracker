// BDBT Design System
// Comprehensive design tokens for consistent UI

export const designSystem = {
  // Color Palette
  colors: {
    // Primary brand colors - BDBT Blue
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary accent colors - BDBT Teal
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    
    // Success states
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning states
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error states
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral colors
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Glass effect backgrounds
    glass: {
      light: 'rgba(255, 255, 255, 0.8)',
      medium: 'rgba(255, 255, 255, 0.6)',
      strong: 'rgba(255, 255, 255, 0.9)',
    },
    
    // BDBT Brand Colors
    bdbt: {
      primary: '#2563eb',    // BDBT Blue
      secondary: '#14b8a6',   // BDBT Teal
      accent: '#0891b2',      // BDBT Cyan
      light: '#f0f9ff',       // Light blue background
      dark: '#1e40af',        // Dark blue text
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Spacing Scale (rem values)
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Animation & Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component-specific tokens
  components: {
    card: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropBlur: 'blur(12px)',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      borderRadius: '0.75rem',
      padding: '1rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    
    button: {
      primary: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      
      secondary: {
        background: 'rgba(255, 255, 255, 0.8)',
        color: '#1e40af',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        backdropBlur: 'blur(12px)',
      },
    },
    
    input: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(203, 213, 225, 0.6)',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      focus: {
        border: '1px solid #3b82f6',
        outline: '2px solid rgba(59, 130, 246, 0.1)',
      },
    },
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const;

// Helper functions for common patterns
export const glassMorphism = (opacity: keyof typeof designSystem.colors.glass = 'light') => ({
  backgroundColor: designSystem.colors.glass[opacity],
  backdropFilter: 'blur(12px)',
  border: `1px solid ${designSystem.colors.primary[100]}`,
});

export const cardStyles = () => ({
  ...glassMorphism('light'),
  borderRadius: designSystem.borderRadius.xl,
  padding: designSystem.spacing[4],
  boxShadow: designSystem.shadows.md,
});

export const buttonStyles = (variant: 'primary' | 'secondary' = 'primary') => {
  const styles = designSystem.components.button[variant];
  return {
    ...styles,
    cursor: 'pointer',
    userSelect: 'none' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designSystem.spacing[2],
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: variant === 'primary' ? designSystem.shadows.lg : designSystem.shadows.md,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };
};

export default designSystem;