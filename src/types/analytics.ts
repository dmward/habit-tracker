export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
  totalCompletions: number;
  totalDays: number;
  lastCompletedDate?: string;
}

export interface OverallStats {
  totalHabits: number;
  activeHabits: number;
  averageCompletionRate: number;
  totalCheckIns: number;
  bestStreak: {
    habitId: string;
    habitName: string;
    streak: number;
  } | null;
}

export interface TrendData {
  date: string;
  completionCount: number;
  completionRate: number;
}
