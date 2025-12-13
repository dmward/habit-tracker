import { useState } from 'react';
import type { Habit } from '../../types/habit';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';

interface HabitListProps {
  habits: Habit[];
}

export default function HabitList({ habits }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No habits yet. Add your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={(h) => setEditingHabit(h)}
          />
        ))}
      </div>

      {editingHabit && (
        <HabitForm
          isOpen={true}
          onClose={() => setEditingHabit(null)}
          habit={editingHabit}
        />
      )}
    </>
  );
}
