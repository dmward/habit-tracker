import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, parseISO, isFuture } from 'date-fns';
import { useDateSelection } from '../../hooks/useDateSelection';
import Button from '../common/Button';

export default function DateNavigator() {
  const { selectedDate, setSelectedDate, goToToday } = useDateSelection();

  const selectedDateObj = parseISO(selectedDate);
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = isFuture(selectedDateObj) && !isToday;

  const handlePrevDay = () => {
    const prevDay = format(subDays(selectedDateObj, 1), 'yyyy-MM-dd');
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = format(addDays(selectedDateObj, 1), 'yyyy-MM-dd');
    setSelectedDate(nextDay);
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Previous Day Button */}
      <button
        onClick={handlePrevDay}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Date Display and Picker */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className="relative">
          <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDatePickerChange}
            className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(selectedDateObj, 'EEEE, MMMM d, yyyy')}
          </div>
          {isToday && (
            <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              Today
            </div>
          )}
          {isFutureDate && (
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Future Date
            </div>
          )}
        </div>
      </div>

      {/* Next Day Button */}
      <button
        onClick={handleNextDay}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Today Button */}
      {!isToday && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="ml-2"
        >
          Today
        </Button>
      )}
    </div>
  );
}
