/**
 * Error handling utility functions
 */

/**
 * Custom error types
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'APIError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Safely parse JSON with error handling
 */
export const safeJSONParse = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return null;
  }
};

/**
 * Handle async operation with error handling
 */
export const handleAsync = async <T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as Error];
  }
};