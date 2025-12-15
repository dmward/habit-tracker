import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useHabitStore, getCurrentMonth } from '../store/habitStore';
import { useDateSelection } from '../hooks/useDateSelection';
import DailyCheckIn from '../components/habits/DailyCheckIn';
import MomentCard from '../components/journal/MomentCard';
import HabitSelector from '../components/habits/HabitSelector';
import MonthlyPlanner from '../components/habits/MonthlyPlanner';

export default function Dashboard() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMonthlyPlanner, setShowMonthlyPlanner] = useState(false);
  const { hasHabitsForMonth } = useHabitStore();
  const { selectedDate } = useDateSelection();

  const currentMonth = getCurrentMonth();
  const hasCurrentMonthHabits = hasHabitsForMonth(currentMonth);
  const selectedDateObj = parseISO(selectedDate);
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  // Show monthly planner if no habits for current month
  useEffect(() => {
    if (!hasCurrentMonthHabits) {
      setShowMonthlyPlanner(true);
    }
  }, [hasCurrentMonthHabits]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isToday ? "Today's Habits" : 'Daily Habits'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(selectedDateObj, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <DailyCheckIn onAddHabit={() => setShowTemplates(true)} />

      {/* Daily Journal */}
      <div className="mt-6">
        <MomentCard />
      </div>

      <HabitSelector isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
      <MonthlyPlanner
        isOpen={showMonthlyPlanner}
        onClose={() => setShowMonthlyPlanner(false)}
      />
    </div>
  );
}
