import { supabase } from './supabase';
import type { DbHabit, DbHabitCompletion, DbJournalEntry } from '../types/database';

// ============================================
// HABITS SERVICE
// ============================================
export const habitsService = {
  async fetchAll(): Promise<DbHabit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async fetchByMonth(month: string): Promise<DbHabit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('month', month)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async create(
    habit: Omit<DbHabit, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DbHabit> {
    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<Omit<DbHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<DbHabit> {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// COMPLETIONS SERVICE
// ============================================
export const completionsService = {
  async fetchAll(): Promise<DbHabitCompletion[]> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async fetchByHabitId(habitId: string): Promise<DbHabitCompletion[]> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async fetchByDateRange(
    startDate: string,
    endDate: string
  ): Promise<DbHabitCompletion[]> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data ?? [];
  },

  async upsert(
    completion: Omit<DbHabitCompletion, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DbHabitCompletion> {
    const { data, error } = await supabase
      .from('habit_completions')
      .upsert(completion, {
        onConflict: 'user_id,habit_id,date',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(habitId: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date);

    if (error) throw error;
  },

  async deleteByHabitId(habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId);

    if (error) throw error;
  },
};

// ============================================
// JOURNAL SERVICE
// ============================================
export const journalService = {
  async fetchAll(): Promise<DbJournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async fetchByDate(date: string): Promise<DbJournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsert(
    entry: Omit<DbJournalEntry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DbJournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(entry, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(date: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('date', date);

    if (error) throw error;
  },

  async deleteAll(): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().neq('id', '');

    if (error) throw error;
  },
};

// ============================================
// BULK OPERATIONS (for migration/reset)
// ============================================
export const bulkService = {
  async deleteAllUserData(): Promise<void> {
    // Delete in order to respect foreign keys
    await supabase.from('habit_completions').delete().neq('id', '');
    await supabase.from('habits').delete().neq('id', '');
    await supabase.from('journal_entries').delete().neq('id', '');
  },
};
