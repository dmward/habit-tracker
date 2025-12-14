import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDateSelection } from '../hooks/useDateSelection';
import { useHabitStore } from '../store/habitStore';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarLegend from '../components/calendar/CalendarLegend';
import Button from '../components/common/Button';

export default function Calendar() {
  const [viewingMonth, setViewingMonth] = useState(new Date());
  const { selectedDate } = useDateSelection();
  const { habits } = useHabitStore();

  const handlePrevMonth = () => {
    setViewingMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setViewingMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setViewingMonth(new Date());
  };

  const activeHabits = habits.filter(h => !h.archived);
  const monthName = format(viewingMonth, 'MMMM yyyy');
  const isCurrentMonth = format(viewingMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calendar
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your habit completion history
          </p>
        </div>

        {!isCurrentMonth && (
          <Button variant="outline" size="sm" onClick={handleToday}>
            Current Month
          </Button>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {monthName}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Calendar Content */}
      {activeHabits.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <CalendarGrid month={viewingMonth} selectedDate={selectedDate} />
          </div>

          {/* Legend */}
          <div className="lg:col-span-1">
            <CalendarLegend />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No habits yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking habits to see your completion calendar!
          </p>
        </div>
      )}
    </div>
  );
}
