import { Flame, Award } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { calculateHabitStats } from '../../utils/statsCalculator';
import Card from '../common/Card';

export default function StreakDisplay() {
  const { habits, completions } = useHabitStore();
  const activeHabits = habits.filter((h) => !h.archived);

  const habitStats = activeHabits
    .map((habit) => ({
      habit,
      stats: calculateHabitStats(habit, completions),
    }))
    .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);

  if (habitStats.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Habit Streaks
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No habits to track yet
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        Habit Streaks
      </h3>
      <div className="space-y-3">
        {habitStats.map(({ habit, stats }, index) => (
          <div
            key={habit.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {index === 0 && stats.currentStreak > 0 && (
                <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
              <div className="text-2xl flex-shrink-0">{habit.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {habit.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Best: {stats.longestStreak} days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame
                className={`w-5 h-5 ${
                  stats.currentStreak > 0
                    ? 'text-orange-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.currentStreak}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
