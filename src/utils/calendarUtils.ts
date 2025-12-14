import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  subDays,
} from 'date-fns';
import type { Habit, HabitCompletion } from '../types/habit';
import { HabitType } from '../types/habit';
import { calculateStreak } from './statsCalculator';

/**
 * Generates a 2D array representing weeks and days for a calendar grid
 * Each week is an array of 7 Date objects (Sunday-Saturday)
 */
export function generateCalendarGrid(month: Date): Date[][] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Extend to full weeks (Sunday-Saturday)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Get all days in the range
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group into weeks (rows of 7)
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Calculates the completion rate for a specific date
 * Returns percentage (0-100) of how many active habits were completed
 */
export function getDayCompletionRate(
  date: string,
  habits: Habit[],
  completions: HabitCompletion[]
): number {
  const activeHabits = habits.filter(h => !h.archived);

  if (activeHabits.length === 0) return 0;

  const completedCount = activeHabits.filter(habit => {
    const completion = completions.find(
      c => c.habitId === habit.id && c.date === date
    );

    // Count as completed if:
    // - Checkbox habit is marked completed
    // - Numeric habit has a value entered
    return completion?.completed ||
           (habit.type === HabitType.NUMERIC && completion?.value !== undefined);
  }).length;

  return Math.round((completedCount / activeHabits.length) * 100);
}

/**
 * Gets list of habits that were completed on a specific date
 * Useful for showing individual habit indicators
 */
export function getCompletedHabitsForDay(
  date: string,
  habits: Habit[],
  completions: HabitCompletion[]
): Habit[] {
  return habits.filter(habit => {
    const completion = completions.find(
      c => c.habitId === habit.id && c.date === date
    );

    return completion?.completed ||
           (habit.type === HabitType.NUMERIC && completion?.value !== undefined);
  }).filter(h => !h.archived);
}

/**
 * Identifies all dates that are part of active streaks
 * Returns a Set of date strings in 'yyyy-MM-dd' format
 */
export function getStreakDays(
  habits: Habit[],
  completions: HabitCompletion[]
): Set<string> {
  const streakDays = new Set<string>();
  const today = new Date();

  habits.filter(h => !h.archived).forEach(habit => {
    const { current } = calculateStreak(completions, habit.id);

    if (current > 0) {
      // Add the last N days (current streak length) to the streak set
      for (let i = 0; i < current; i++) {
        const day = format(subDays(today, i), 'yyyy-MM-dd');
        streakDays.add(day);
      }
    }
  });

  return streakDays;
}

/**
 * Gets the background color class based on completion rate
 * Returns Tailwind CSS classes for light and dark mode
 */
export function getCompletionColorClass(completionRate: number): string {
  if (completionRate === 0) {
    return 'bg-gray-100 dark:bg-gray-800';
  } else if (completionRate < 25) {
    return 'bg-red-100 dark:bg-red-900/30';
  } else if (completionRate < 50) {
    return 'bg-orange-100 dark:bg-orange-900/30';
  } else if (completionRate < 75) {
    return 'bg-yellow-100 dark:bg-yellow-900/30';
  } else if (completionRate < 100) {
    return 'bg-green-100 dark:bg-green-900/30';
  } else {
    return 'bg-green-200 dark:bg-green-900/50';
  }
}
