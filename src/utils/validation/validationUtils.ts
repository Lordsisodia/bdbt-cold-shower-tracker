/**
 * Validation utility functions
 */

/**
 * Check if a value is null or undefined
 */
export const isNullOrUndefined = (value: any): boolean => {
  return value === null || value === undefined;
};

/**
 * Check if a value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') return !isNaN(Number(value));
  return false;
};

/**
 * Check if a value is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string meets minimum length requirement
 */
export const meetsMinLength = (str: string, minLength: number): boolean => {
  return str.length >= minLength;
};

/**
 * Check if an object has all required properties
 */
export const hasRequiredProperties = <T extends object>(
  obj: T,
  requiredProps: (keyof T)[]
): boolean => {
  return requiredProps.every(prop => !isNullOrUndefined(obj[prop]));
};