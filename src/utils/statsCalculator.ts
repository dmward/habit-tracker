import {
  format,
  subDays,
  differenceInDays,
  parseISO,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import type { Habit, HabitCompletion } from '../types/habit';
import type { HabitStats, OverallStats, TrendData } from '../types/analytics';

export function calculateStreak(
  completions: HabitCompletion[],
  habitId: string
): { current: number; longest: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId && c.completed)
    .map((c) => c.date)
    .sort();

  if (habitCompletions.length === 0) {
    return { current: 0, longest: 0 };
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if streak is active (completed today or yesterday)
  const lastCompletion = habitCompletions[habitCompletions.length - 1];
  const isActive = lastCompletion === today || lastCompletion === yesterday;

  if (isActive) {
    // Calculate current streak working backwards from today/yesterday
    let checkDate = lastCompletion === today ? new Date() : subDays(new Date(), 1);
    currentStreak = 1;

    for (let i = habitCompletions.length - 2; i >= 0; i--) {
      const prevDate = format(subDays(checkDate, 1), 'yyyy-MM-dd');
      if (habitCompletions[i] === prevDate) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 0; i < habitCompletions.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = parseISO(habitCompletions[i]);
      const prevDate = parseISO(habitCompletions[i - 1]);
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

export function calculateCompletionRate(
  completions: HabitCompletion[],
  habitId: string,
  startDate: Date,
  endDate: Date = new Date()
): number {
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const completedDays = completions.filter(
    (c) =>
      c.habitId === habitId &&
      c.completed &&
      isWithinInterval(parseISO(c.date), { start: startDate, end: endDate })
  ).length;

  return totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
}

export function calculateHabitStats(
  habit: Habit,
  completions: HabitCompletion[]
): HabitStats {
  const habitCompletions = completions.filter((c) => c.habitId === habit.id);
  const { current, longest } = calculateStreak(completions, habit.id);

  const startDate = parseISO(habit.createdAt);
  const completionRate = calculateCompletionRate(
    completions,
    habit.id,
    startDate
  );

  const totalCompletions = habitCompletions.filter((c) => c.completed).length;
  const totalDays = differenceInDays(new Date(), startDate) + 1;

  const lastCompleted = habitCompletions
    .filter((c) => c.completed)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  return {
    habitId: habit.id,
    currentStreak: current,
    longestStreak: longest,
    completionRate,
    totalCompletions,
    totalDays,
    lastCompletedDate: lastCompleted?.date,
  };
}

export function calculateOverallStats(
  habits: Habit[],
  completions: HabitCompletion[]
): OverallStats {
  const activeHabits = habits.filter((h) => !h.archived);

  if (activeHabits.length === 0) {
    return {
      totalHabits: habits.length,
      activeHabits: 0,
      averageCompletionRate: 0,
      totalCheckIns: 0,
      bestStreak: null,
    };
  }

  const habitStats = activeHabits.map((h) => calculateHabitStats(h, completions));

  const averageCompletionRate =
    habitStats.reduce((sum, stat) => sum + stat.completionRate, 0) /
    habitStats.length;

  const totalCheckIns = completions.filter((c) => c.completed).length;

  const bestStreakStat = habitStats.reduce((best, current) => {
    return current.currentStreak > (best?.currentStreak || 0) ? current : best;
  }, habitStats[0]);

  const bestStreakHabit = activeHabits.find(
    (h) => h.id === bestStreakStat.habitId
  );

  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    averageCompletionRate,
    totalCheckIns,
    bestStreak: bestStreakHabit
      ? {
          habitId: bestStreakHabit.id,
          habitName: bestStreakHabit.name,
          streak: bestStreakStat.currentStreak,
        }
      : null,
  };
}

export function calculateTrendData(
  completions: HabitCompletion[],
  totalHabits: number,
  days: number = 30
): TrendData[] {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  return allDates.map((date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayCompletions = completions.filter(
      (c) => c.date === dateString && c.completed
    );

    const completionCount = dayCompletions.length;
    const completionRate =
      totalHabits > 0 ? (completionCount / totalHabits) * 100 : 0;

    return {
      date: dateString,
      completionCount,
      completionRate,
    };
  });
}

export function getWeeklyData(
  completions: HabitCompletion[],
  habits: Habit[]
): TrendData[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const activeHabits = habits.filter((h) => !h.archived);

  return daysOfWeek.map((date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayCompletions = completions.filter(
      (c) => c.date === dateString && c.completed
    );

    const completionCount = dayCompletions.length;
    const completionRate =
      activeHabits.length > 0
        ? (completionCount / activeHabits.length) * 100
        : 0;

    return {
      date: dateString,
      completionCount,
      completionRate,
    };
  });
}
