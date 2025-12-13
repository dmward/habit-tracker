import { Edit2, Trash2, Archive } from 'lucide-react';
import type { Habit } from '../../types/habit';
import { useHabitStore } from '../../store/habitStore';
import { CATEGORY_LABELS } from '../../constants/habits';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export default function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { deleteHabit, archiveHabit } = useHabitStore();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      deleteHabit(habit.id);
      toast.success('Habit deleted');
    }
  };

  const handleArchive = () => {
    archiveHabit(habit.id);
    toast.success('Habit archived');
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="text-4xl flex-shrink-0"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
        >
          {habit.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {habit.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-block px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: `${habit.color}20`,
                color: habit.color,
              }}
            >
              {CATEGORY_LABELS[habit.category]}
            </span>
            {habit.reminderEnabled && habit.reminderTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                🔔 {habit.reminderTime}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(habit)}
            title="Edit habit"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          {!habit.archived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              title="Archive habit"
            >
              <Archive className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Delete habit"
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
