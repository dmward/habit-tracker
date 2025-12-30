import { useState } from 'react';
import { Plus, Library } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '../store/habitStore';
import HabitList from '../components/habits/HabitList';
import HabitForm from '../components/habits/HabitForm';
import HabitSelector from '../components/habits/HabitSelector';
import Button from '../components/common/Button';

export default function HabitsManager() {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const { getCurrentMonthHabits } = useHabitStore();

  const currentMonthHabits = getCurrentMonthHabits();
  const activeHabits = currentMonthHabits.filter((h) => !h.archived);
  const archivedHabits = currentMonthHabits.filter((h) => h.archived);

  const monthName = format(new Date(), 'MMMM yyyy');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Habits</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {monthName}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="gap-2"
          >
            <Library className="w-4 h-4" />
            Browse Templates
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCustomForm(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom
          </Button>
        </div>
      </div>

      {/* Active Habits */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Active Habits for This Month ({activeHabits.length})
        </h2>
        <HabitList habits={activeHabits} />
      </div>

      {/* Archived Habits */}
      {archivedHabits.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">
            Archived Habits ({archivedHabits.length})
          </h2>
          <HabitList habits={archivedHabits} />
        </div>
      )}

      {/* Modals */}
      <HabitForm isOpen={showCustomForm} onClose={() => setShowCustomForm(false)} />
      <HabitSelector isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
    </div>
  );
}
