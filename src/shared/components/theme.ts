// Theme configuration for the shared component library
export const theme = {
  // Color tokens
  colors: {
    primary: {
      50: '#ebf5ff',
      100: '#e1effe',
      200: '#c3ddfd',
      300: '#a4cafe',
      400: '#76a9fa',
      500: '#3f83f8',
      600: '#1c64f2',
      700: '#1a56db',
      800: '#1e429f',
      900: '#233876',
    },
    // Add other color scales (secondary, neutral, success, warning, error)
  },

  // Typography
  typography: {
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, monospace',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },

  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    // Add more spacing values
  },

  // Border radius
  radii: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};