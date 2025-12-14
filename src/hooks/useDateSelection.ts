import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';

/**
 * Custom hook to manage selected date state via URL search params
 * Stores date in URL as ?date=YYYY-MM-DD
 * Defaults to today if no date parameter is present
 */
export function useDateSelection() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get date from URL or default to today
  const selectedDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  // Update selected date in URL
  const setSelectedDate = (date: string) => {
    setSearchParams({ date });
  };

  // Jump back to today
  const goToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setSearchParams({ date: today });
  };

  // Clear date param (returns to today)
  const clearDate = () => {
    setSearchParams({});
  };

  return {
    selectedDate,
    setSelectedDate,
    goToToday,
    clearDate,
  };
}
