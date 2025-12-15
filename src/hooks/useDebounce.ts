import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * Useful for auto-save functionality - waits for user to stop typing before triggering save
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (e.g., 1000 = 1 second)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
