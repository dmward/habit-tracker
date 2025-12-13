export enum HabitCategory {
  HEALTH = 'health',
  FITNESS = 'fitness',
  PRODUCTIVITY = 'productivity',
  MINDFULNESS = 'mindfulness',
  LEARNING = 'learning',
  SOCIAL = 'social',
  CREATIVE = 'creative',
  CUSTOM = 'custom',
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  category: HabitCategory;
  reminderTime?: string; // ISO time string "HH:MM"
  reminderEnabled: boolean;
  createdAt: string; // ISO date
  archived: boolean;
  month: string; // Format: "YYYY-MM" - the month this habit belongs to
}

export interface HabitCompletion {
  habitId: string;
  date: string; // ISO date YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO datetime
  note?: string;
}

export interface HabitTemplate {
  name: string;
  description: string;
  icon: string;
  category: HabitCategory;
  suggestedColor: string;
}
