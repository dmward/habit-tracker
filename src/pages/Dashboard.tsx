import { useState } from 'react';
import { format } from 'date-fns';
import DailyCheckIn from '../components/habits/DailyCheckIn';
import HabitSelector from '../components/habits/HabitSelector';

export default function Dashboard() {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Today's Habits</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <DailyCheckIn onAddHabit={() => setShowTemplates(true)} />

      <HabitSelector isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
    </div>
  );
}
