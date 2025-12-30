import { supabase } from './supabase';
import type { Habit, HabitCompletion } from '../types/habit';
import type { JournalEntry } from '../types/journal';

interface LocalStorageHabitData {
  state: {
    habits: Habit[];
    completions: HabitCompletion[];
  };
  version: number;
}

interface LocalStorageJournalData {
  state: {
    entries: JournalEntry[];
  };
  version: number;
}

export interface MigrationResult {
  success: boolean;
  migratedHabits: number;
  migratedCompletions: number;
  migratedJournalEntries: number;
  errors: string[];
}

/**
 * Check if there's existing data in localStorage that can be migrated
 */
export function hasLocalStorageData(): boolean {
  const habitData = localStorage.getItem('habit-tracker-storage');
  const journalData = localStorage.getItem('journal-storage');

  if (habitData) {
    try {
      const parsed = JSON.parse(habitData) as LocalStorageHabitData;
      if (parsed.state?.habits?.length > 0 || parsed.state?.completions?.length > 0) {
        return true;
      }
    } catch {
      // Invalid data
    }
  }

  if (journalData) {
    try {
      const parsed = JSON.parse(journalData) as LocalStorageJournalData;
      if (parsed.state?.entries?.length > 0) {
        return true;
      }
    } catch {
      // Invalid data
    }
  }

  return false;
}

/**
 * Migrate data from localStorage to Supabase
 */
export async function migrateLocalStorageToSupabase(
  userId: string
): Promise<MigrationResult> {
  const errors: string[] = [];
  let migratedHabits = 0;
  let migratedCompletions = 0;
  let migratedJournalEntries = 0;

  // Check if user already has data in Supabase
  const { data: existingHabits } = await supabase
    .from('habits')
    .select('id')
    .limit(1);

  if (existingHabits && existingHabits.length > 0) {
    return {
      success: true,
      migratedHabits: 0,
      migratedCompletions: 0,
      migratedJournalEntries: 0,
      errors: ['Data already exists in database - skipping migration'],
    };
  }

  // Map old habit IDs to new UUIDs
  const oldIdToNewId: Record<string, string> = {};

  // Migrate habits
  const habitStorageKey = 'habit-tracker-storage';
  const habitData = localStorage.getItem(habitStorageKey);

  if (habitData) {
    try {
      const parsed: LocalStorageHabitData = JSON.parse(habitData);

      // Insert habits
      for (const habit of parsed.state.habits || []) {
        const { data, error } = await supabase
          .from('habits')
          .insert({
            user_id: userId,
            name: habit.name,
            description: habit.description ?? null,
            icon: habit.icon ?? null,
            color: habit.color,
            category: habit.category,
            type: habit.type || 'checkbox',
            reminder_time: habit.reminderTime ?? null,
            reminder_enabled: habit.reminderEnabled ?? false,
            archived: habit.archived ?? false,
            month: habit.month,
            unit: habit.unit ?? null,
            target_value: habit.targetValue ?? null,
            min_value: habit.minValue ?? null,
            max_value: habit.maxValue ?? null,
            created_at: habit.createdAt,
          })
          .select('id')
          .single();

        if (error) {
          errors.push(`Failed to migrate habit "${habit.name}": ${error.message}`);
        } else if (data) {
          oldIdToNewId[habit.id] = data.id;
          migratedHabits++;
        }
      }

      // Insert completions with mapped habit IDs
      for (const completion of parsed.state.completions || []) {
        const newHabitId = oldIdToNewId[completion.habitId];
        if (!newHabitId) {
          // Skip completions for habits that failed to migrate
          continue;
        }

        const { error } = await supabase.from('habit_completions').insert({
          user_id: userId,
          habit_id: newHabitId,
          date: completion.date,
          completed: completion.completed,
          completed_at: completion.completedAt ?? null,
          note: completion.note ?? null,
          value: completion.value ?? null,
        });

        if (error) {
          errors.push(`Failed to migrate completion: ${error.message}`);
        } else {
          migratedCompletions++;
        }
      }
    } catch (e) {
      errors.push(`Failed to parse habit storage: ${e}`);
    }
  }

  // Migrate journal entries
  const journalStorageKey = 'journal-storage';
  const journalData = localStorage.getItem(journalStorageKey);

  if (journalData) {
    try {
      const parsed: LocalStorageJournalData = JSON.parse(journalData);

      for (const entry of parsed.state.entries || []) {
        const { error } = await supabase.from('journal_entries').insert({
          user_id: userId,
          date: entry.date,
          content: entry.content,
          created_at: entry.createdAt,
        });

        if (error) {
          errors.push(`Failed to migrate journal entry ${entry.date}: ${error.message}`);
        } else {
          migratedJournalEntries++;
        }
      }
    } catch (e) {
      errors.push(`Failed to parse journal storage: ${e}`);
    }
  }

  // Clear localStorage after successful migration (only if no errors)
  if (errors.length === 0) {
    localStorage.removeItem(habitStorageKey);
    localStorage.removeItem(journalStorageKey);
  }

  return {
    success: errors.length === 0,
    migratedHabits,
    migratedCompletions,
    migratedJournalEntries,
    errors,
  };
}

/**
 * Clear localStorage data without migrating
 */
export function clearLocalStorageData(): void {
  localStorage.removeItem('habit-tracker-storage');
  localStorage.removeItem('journal-storage');
}
