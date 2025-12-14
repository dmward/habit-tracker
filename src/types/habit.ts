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

export enum HabitType {
  CHECKBOX = 'checkbox', // Simple yes/no completion
  NUMERIC = 'numeric',   // Requires a number value
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  category: HabitCategory;
  type: HabitType; // Type of habit tracking
  reminderTime?: string; // ISO time string "HH:MM"
  reminderEnabled: boolean;
  createdAt: string; // ISO date
  archived: boolean;
  month: string; // Format: "YYYY-MM" - the month this habit belongs to

  // Numeric habit fields
  unit?: string; // e.g., "drinks", "hours", "points", "rating"
  targetValue?: number; // Optional target/goal for numeric habits
  minValue?: number; // Minimum value (default 0)
  maxValue?: number; // Maximum value (e.g., 10 for rating)
}

export interface HabitCompletion {
  habitId: string;
  date: string; // ISO date YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO datetime
  note?: string;

  // For numeric habits
  value?: number; // The numeric value entered
}

export interface HabitTemplate {
  name: string;
  description: string;
  icon: string;
  category: HabitCategory;
  suggestedColor: string;
  type?: HabitType; // Optional, defaults to CHECKBOX
  unit?: string;
  targetValue?: number;
  minValue?: number;
  maxValue?: number;
}
