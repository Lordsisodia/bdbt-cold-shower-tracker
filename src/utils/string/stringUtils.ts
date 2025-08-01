/**
 * String utility functions for consistent string manipulation across the application
 */

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate a string to a maximum length with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

/**
 * Remove special characters from a string
 */
export const removeSpecialChars = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Generate a URL-friendly slug from a string
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if a string is empty or only whitespace
 */
export const isEmptyString = (str: string | null | undefined): boolean => {
  return !str || str.trim().length === 0;
};