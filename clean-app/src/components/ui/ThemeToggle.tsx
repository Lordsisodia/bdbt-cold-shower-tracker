import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 rounded-full w-10 h-10 p-0"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-blue-700" />
      ) : (
        <Sun size={18} className="text-yellow-500" />
      )}
    </Button>
  );
};