import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useHabitStore } from '../../store/habitStore';
import {
  generateCalendarGrid,
  getDayCompletionRate,
  getCompletedHabitsForDay,
  getStreakDays,
} from '../../utils/calendarUtils';
import DayCell from './DayCell';

interface CalendarGridProps {
  month: Date;
  selectedDate?: string;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ month, selectedDate }: CalendarGridProps) {
  const navigate = useNavigate();
  const { habits, completions } = useHabitStore();

  // Generate calendar grid (weeks array)
  const weeks = generateCalendarGrid(month);

  // Calculate streak days once for the entire month
  const streakDays = getStreakDays(habits, completions);

  const handleDayClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    navigate(`/?date=${dateString}`);
  };

  return (
    <div className="space-y-2">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAY_LABELS.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {week.map((date, dayIdx) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const completionRate = getDayCompletionRate(dateString, habits, completions);
              const completedHabits = getCompletedHabitsForDay(dateString, habits, completions);
              const isStreakDay = streakDays.has(dateString);
              const isSelected = selectedDate === dateString;

              return (
                <DayCell
                  key={dayIdx}
                  date={date}
                  currentMonth={month}
                  completionRate={completionRate}
                  completedHabits={completedHabits}
                  isStreakDay={isStreakDay}
                  isSelected={isSelected}
                  onClick={() => handleDayClick(date)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
