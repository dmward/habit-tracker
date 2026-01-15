import { Flame, Award } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import Card from '../common/Card';
import type { Habit, HabitCompletion } from '../../types/habit';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';

// Calculate streak from completions that may span multiple habit IDs (cross-month)
function calculateCombinedStreak(
  completions: HabitCompletion[]
): { current: number; longest: number } {
  const sortedDates = completions
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort();

  // Remove duplicates (same date across different habit IDs)
  const uniqueDates = Array.from(new Set(sortedDates));

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if streak is active (completed today or yesterday)
  const lastCompletion = uniqueDates[uniqueDates.length - 1];
  const isActive = lastCompletion === today || lastCompletion === yesterday;

  if (isActive) {
    // Calculate current streak working backwards from today/yesterday
    let checkDate = lastCompletion === today ? new Date() : subDays(new Date(), 1);
    currentStreak = 1;

    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const prevDate = format(subDays(checkDate, 1), 'yyyy-MM-dd');
      if (uniqueDates[i] === prevDate) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = parseISO(uniqueDates[i]);
      const prevDate = parseISO(uniqueDates[i - 1]);
      const daysDiff = differenceInDays(currentDate, prevDate);

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

export default function StreakDisplay() {
  const { habits, completions } = useHabitStore();
  const activeHabits = habits.filter((h) => !h.archived);

  // Group habits by name to combine cross-month habits
  const habitGroups = new Map<string, Habit[]>();
  activeHabits.forEach((habit) => {
    const key = habit.name.toLowerCase();
    if (!habitGroups.has(key)) {
      habitGroups.set(key, []);
    }
    habitGroups.get(key)!.push(habit);
  });

  // Calculate combined stats for each habit group
  const habitStats = Array.from(habitGroups.entries())
    .map(([_name, groupHabits]) => {
      // Use the most recent habit for display
      const displayHabit = groupHabits.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )[0];

      // Get all habit IDs in this group
      const habitIds = groupHabits.map(h => h.id);

      // Collect all completions for this habit group
      const groupCompletions = completions.filter(c => habitIds.includes(c.habitId));

      // Calculate streak using combined completions
      const streakData = calculateCombinedStreak(groupCompletions);

      return {
        habit: displayHabit,
        stats: {
          currentStreak: streakData.current,
          longestStreak: streakData.longest,
        },
      };
    })
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
