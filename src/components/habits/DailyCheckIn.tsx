import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Plus, Minus } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { HabitType } from '../../types/habit';
import { CATEGORY_LABELS } from '../../constants/habits';
import { useDateSelection } from '../../hooks/useDateSelection';
import Card from '../common/Card';
import Button from '../common/Button';
import DateNavigator from '../calendar/DateNavigator';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface DailyCheckInProps {
  onAddHabit: () => void;
}

export default function DailyCheckIn({ onAddHabit }: DailyCheckInProps) {
  const { getCurrentMonthHabits, toggleCompletion, isHabitCompletedOnDate, setNumericValue, getNumericValue } = useHabitStore();
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  const { selectedDate } = useDateSelection();

  const activeHabits = getCurrentMonthHabits().filter((h) => !h.archived);

  const handleCheckboxToggle = (habitId: string, habitName: string, currentlyCompleted: boolean) => {
    toggleCompletion(habitId, selectedDate);
    if (!currentlyCompleted) {
      toast.success(`🎉 ${habitName} completed!`, {
        duration: 2000,
        icon: '✅',
      });
    }
  };

  const handleNumericChange = (habitId: string, value: string) => {
    setNumericInputs(prev => ({ ...prev, [habitId]: value }));
  };

  const handleNumericSubmit = (habitId: string, habitName: string) => {
    const value = parseFloat(numericInputs[habitId] || '0');
    if (!isNaN(value) && value >= 0) {
      setNumericValue(habitId, selectedDate, value);
      toast.success(`✅ ${habitName}: ${value} recorded!`, {
        duration: 2000,
      });
      setNumericInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[habitId];
        return newInputs;
      });
    }
  };

  const handleNumericIncrement = (habitId: string, maxValue?: number) => {
    const currentValue = parseFloat(numericInputs[habitId] || '0');
    const newValue = currentValue + 1;
    if (!maxValue || newValue <= maxValue) {
      setNumericInputs(prev => ({ ...prev, [habitId]: newValue.toString() }));
    }
  };

  const handleNumericDecrement = (habitId: string, minValue?: number) => {
    const currentValue = parseFloat(numericInputs[habitId] || '0');
    const newValue = currentValue - 1;
    const min = minValue ?? 0;
    if (newValue >= min) {
      setNumericInputs(prev => ({ ...prev, [habitId]: newValue.toString() }));
    }
  };

  const completedCheckboxCount = activeHabits.filter((h) =>
    h.type === HabitType.CHECKBOX && isHabitCompletedOnDate(h.id, selectedDate)
  ).length;

  const completedNumericCount = activeHabits.filter((h) =>
    h.type === HabitType.NUMERIC && getNumericValue(h.id, selectedDate) !== undefined
  ).length;

  const totalCompleted = completedCheckboxCount + completedNumericCount;

  const completionPercentage =
    activeHabits.length > 0
      ? Math.round((totalCompleted / activeHabits.length) * 100)
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
      {/* Date Navigation */}
      <DateNavigator />

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
          {totalCompleted} of {activeHabits.length} habits completed
        </p>
      </Card>

      {/* Habit List */}
      <div className="space-y-3">
        {activeHabits.map((habit) => {
          const isCheckbox = habit.type === HabitType.CHECKBOX || !habit.type;
          const isCompleted = isCheckbox
            ? isHabitCompletedOnDate(habit.id, selectedDate)
            : getNumericValue(habit.id, selectedDate) !== undefined;
          const numericValue = getNumericValue(habit.id, selectedDate);
          const currentInput = numericInputs[habit.id] || '';

          return (
            <Card
              key={habit.id}
              className={clsx(
                'p-4 transition-all duration-300',
                isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                  : 'hover:shadow-md'
              )}
            >
              <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="inline-block px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: `${habit.color}20`,
                        color: habit.color,
                      }}
                    >
                      {CATEGORY_LABELS[habit.category]}
                    </span>
                    {habit.type === HabitType.NUMERIC && habit.targetValue && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Target: {habit.targetValue} {habit.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Input/Action */}
                {isCheckbox ? (
                  <button
                    onClick={() => handleCheckboxToggle(habit.id, habit.name, isCompleted)}
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
                ) : (
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {numericValue}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {habit.unit}
                        </span>
                        <button
                          onClick={() => {
                            setNumericInputs(prev => ({ ...prev, [habit.id]: numericValue?.toString() || '0' }));
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleNumericDecrement(habit.id, habit.minValue)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={currentInput}
                            onChange={(e) => handleNumericChange(habit.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleNumericSubmit(habit.id, habit.name);
                              }
                            }}
                            placeholder="0"
                            min={habit.minValue ?? 0}
                            max={habit.maxValue}
                            className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleNumericIncrement(habit.id, habit.maxValue)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleNumericSubmit(habit.id, habit.name)}
                          disabled={!currentInput}
                        >
                          Save
                        </Button>
                      </>
                    )}
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
              You've completed all your habits selectedDate. Keep up the amazing work!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
