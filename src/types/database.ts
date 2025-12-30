import type { Habit, HabitCompletion, HabitCategory, HabitType } from './habit';
import type { JournalEntry } from './journal';

// Database row types (snake_case matching PostgreSQL)
export interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  category: string;
  type: string;
  reminder_time: string | null;
  reminder_enabled: boolean;
  archived: boolean;
  month: string;
  unit: string | null;
  target_value: number | null;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbHabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  completed_at: string | null;
  note: string | null;
  value: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbJournalEntry {
  id: string;
  user_id: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Conversion: Database -> Client
export function dbHabitToHabit(db: DbHabit): Habit {
  return {
    id: db.id,
    name: db.name,
    description: db.description ?? undefined,
    icon: db.icon ?? undefined,
    color: db.color,
    category: db.category as HabitCategory,
    type: (db.type as HabitType) || 'checkbox',
    reminderTime: db.reminder_time ?? undefined,
    reminderEnabled: db.reminder_enabled,
    createdAt: db.created_at,
    archived: db.archived,
    month: db.month,
    unit: db.unit ?? undefined,
    targetValue: db.target_value ?? undefined,
    minValue: db.min_value ?? undefined,
    maxValue: db.max_value ?? undefined,
  };
}

export function dbCompletionToCompletion(db: DbHabitCompletion): HabitCompletion {
  return {
    habitId: db.habit_id,
    date: db.date,
    completed: db.completed,
    completedAt: db.completed_at ?? undefined,
    note: db.note ?? undefined,
    value: db.value ?? undefined,
  };
}

export function dbJournalToJournal(db: DbJournalEntry): JournalEntry {
  return {
    date: db.date,
    content: db.content,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Conversion: Client -> Database (for inserts/updates)
export function habitToDbInsert(
  habit: Omit<Habit, 'id'>,
  userId: string
): Omit<DbHabit, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    name: habit.name,
    description: habit.description ?? null,
    icon: habit.icon ?? null,
    color: habit.color,
    category: habit.category,
    type: habit.type || 'checkbox',
    reminder_time: habit.reminderTime ?? null,
    reminder_enabled: habit.reminderEnabled,
    archived: habit.archived,
    month: habit.month,
    unit: habit.unit ?? null,
    target_value: habit.targetValue ?? null,
    min_value: habit.minValue ?? null,
    max_value: habit.maxValue ?? null,
  };
}

export function completionToDbUpsert(
  completion: HabitCompletion,
  userId: string
): Omit<DbHabitCompletion, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    habit_id: completion.habitId,
    date: completion.date,
    completed: completion.completed,
    completed_at: completion.completedAt ?? null,
    note: completion.note ?? null,
    value: completion.value ?? null,
  };
}

export function journalToDbUpsert(
  entry: Omit<JournalEntry, 'createdAt' | 'updatedAt'>,
  userId: string
): Omit<DbJournalEntry, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    date: entry.date,
    content: entry.content,
  };
}
