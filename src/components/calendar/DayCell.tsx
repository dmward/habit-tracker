import { format, isSameMonth, isToday as isTodayFn } from 'date-fns';
import { Flame } from 'lucide-react';
import clsx from 'clsx';
import type { Habit } from '../../types/habit';
import { getCompletionColorClass } from '../../utils/calendarUtils';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  completionRate: number;
  completedHabits: Habit[];
  isStreakDay: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function DayCell({
  date,
  currentMonth,
  completionRate,
  completedHabits,
  isStreakDay,
  isSelected,
  onClick,
}: DayCellProps) {
  const dayNumber = format(date, 'd');
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isToday = isTodayFn(date);

  const colorClass = getCompletionColorClass(completionRate);

  // Show up to 4 habit icons
  const visibleHabits = completedHabits.slice(0, 4);
  const remainingCount = completedHabits.length - 4;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative aspect-square p-2 rounded-lg transition-all duration-200',
        'hover:shadow-md hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        colorClass,
        !isCurrentMonth && 'opacity-40',
        isToday && 'ring-2 ring-blue-500',
        isSelected && 'ring-2 ring-primary-600 ring-offset-2'
      )}
      aria-label={`${format(date, 'MMMM d, yyyy')} - ${completionRate}% completed`}
    >
      {/* Streak Indicator */}
      {isStreakDay && (
        <div className="absolute top-1 right-1">
          <Flame className="w-3 h-3 text-orange-500" fill="currentColor" />
        </div>
      )}

      {/* Day Number */}
      <div
        className={clsx(
          'text-sm font-semibold mb-1',
          isCurrentMonth
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 dark:text-gray-600'
        )}
      >
        {dayNumber}
      </div>

      {/* Habit Icons */}
      {completedHabits.length > 0 && (
        <div className="flex flex-wrap gap-0.5 items-center justify-center">
          {visibleHabits.map((habit, idx) => (
            <span
              key={`${habit.id}-${idx}`}
              className="text-xs"
              title={habit.name}
              style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
            >
              {habit.icon}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
              +{remainingCount}
            </span>
          )}
        </div>
      )}

      {/* Completion Percentage (on hover) */}
      {completionRate > 0 && (
        <div className="absolute bottom-1 left-1 text-[10px] font-bold text-gray-700 dark:text-gray-300 opacity-60">
          {completionRate}%
        </div>
      )}
    </button>
  );
}
