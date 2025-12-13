import { format } from 'date-fns';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { CATEGORY_LABELS } from '../../constants/habits';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface DailyCheckInProps {
  onAddHabit: () => void;
}

export default function DailyCheckIn({ onAddHabit }: DailyCheckInProps) {
  const { getCurrentMonthHabits, toggleCompletion, isHabitCompletedOnDate } = useHabitStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const activeHabits = getCurrentMonthHabits().filter((h) => !h.archived);

  const handleToggle = (habitId: string, habitName: string, currentlyCompleted: boolean) => {
    toggleCompletion(habitId, today);
    if (!currentlyCompleted) {
      toast.success(`🎉 ${habitName} completed!`, {
        duration: 2000,
        icon: '✅',
      });
    }
  };

  const completedCount = activeHabits.filter((h) =>
    isHabitCompletedOnDate(h.id, today)
  ).length;

  const completionPercentage =
    activeHabits.length > 0
      ? Math.round((completedCount / activeHabits.length) * 100)
      : 0;

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          No habits yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start building better habits by adding your first one!
        </p>
        <Button variant="primary" onClick={onAddHabit} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Habit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Progress
          </h2>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {completedCount} of {activeHabits.length} habits completed
        </p>
      </Card>

      {/* Habit List */}
      <div className="space-y-3">
        {activeHabits.map((habit) => {
          const isCompleted = isHabitCompletedOnDate(habit.id, today);

          return (
            <Card
              key={habit.id}
              className={clsx(
                'p-4 transition-all duration-300 cursor-pointer',
                isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                  : 'hover:shadow-md'
              )}
              onClick={() => handleToggle(habit.id, habit.name, isCompleted)}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                  className={clsx(
                    'flex-shrink-0 w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center',
                    isCompleted
                      ? 'bg-green-500 text-white scale-110'
                      : 'border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 animate-bounce-soft" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>

                {/* Icon */}
                <div
                  className={clsx(
                    'text-3xl transition-all duration-300',
                    isCompleted && 'scale-110'
                  )}
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                >
                  {habit.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={clsx(
                      'font-semibold text-lg transition-all',
                      isCompleted
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-900 dark:text-white'
                    )}
                  >
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {habit.description}
                    </p>
                  )}
                  <span
                    className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: `${habit.color}20`,
                      color: habit.color,
                    }}
                  >
                    {CATEGORY_LABELS[habit.category]}
                  </span>
                </div>

                {/* Status Badge */}
                {isCompleted && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                      ✓ Done
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Motivation Message */}
      {completionPercentage === 100 && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">
              Perfect Day!
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              You've completed all your habits today. Keep up the amazing work!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
