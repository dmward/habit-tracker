import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Calendar, ArrowRight, Plus } from 'lucide-react';
import { useHabitStore, getCurrentMonth } from '../../store/habitStore';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';
import HabitSelector from './HabitSelector';
import toast from 'react-hot-toast';

interface MonthlyPlannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MonthlyPlanner({ isOpen, onClose }: MonthlyPlannerProps) {
  const { getHabitsForMonth, carryOverHabit } = useHabitStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());

  const currentMonth = getCurrentMonth();
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
  const previousMonthHabits = getHabitsForMonth(lastMonth).filter((h) => !h.archived);

  const currentMonthName = format(new Date(), 'MMMM yyyy');
  const lastMonthName = format(subMonths(new Date(), 1), 'MMMM');

  const toggleHabit = (habitId: string) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitId)) {
      newSelected.delete(habitId);
    } else {
      newSelected.add(habitId);
    }
    setSelectedHabits(newSelected);
  };

  const handleCarryOver = () => {
    selectedHabits.forEach((habitId) => {
      carryOverHabit(habitId, currentMonth);
    });

    toast.success(
      `Carried over ${selectedHabits.size} habit${selectedHabits.size !== 1 ? 's' : ''} to ${currentMonthName}!`
    );

    onClose();
  };

  const handleSkip = () => {
    toast.success(`Ready to plan ${currentMonthName}!`);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Plan ${currentMonthName}`} size="lg">
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Welcome to {currentMonthName}!
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Select habits from last month to continue, or start fresh with new ones.
                </p>
              </div>
            </div>
          </div>

          {/* Previous Month Habits */}
          {previousMonthHabits.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Habits from {lastMonthName}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {previousMonthHabits.map((habit) => (
                  <Card
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    hover
                    className={`p-3 cursor-pointer transition-all ${
                      selectedHabits.has(habit.id)
                        ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedHabits.has(habit.id)}
                        onChange={() => toggleHabit(habit.id)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="text-2xl">{habit.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {habit.name}
                        </p>
                        {habit.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedHabits.size > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {selectedHabits.size} habit{selectedHabits.size !== 1 ? 's' : ''} selected
                    to carry over
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No habits from last month.</p>
              <p className="text-sm mt-1">Start fresh by adding new habits!</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowTemplates(true)}
            >
              <Plus className="w-4 h-4" />
              Add New Habits from Templates
            </Button>

            <div className="flex gap-3">
              {selectedHabits.size > 0 && (
                <Button variant="primary" className="flex-1 gap-2" onClick={handleCarryOver}>
                  <ArrowRight className="w-4 h-4" />
                  Carry Over {selectedHabits.size} Habit{selectedHabits.size !== 1 ? 's' : ''}
                </Button>
              )}
              <Button
                variant={selectedHabits.size > 0 ? 'secondary' : 'primary'}
                className={selectedHabits.size > 0 ? 'flex-1' : 'w-full'}
                onClick={handleSkip}
              >
                {selectedHabits.size > 0 ? 'Done' : 'Start Fresh'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <HabitSelector isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
    </>
  );
}
