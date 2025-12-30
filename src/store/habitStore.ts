import { create } from 'zustand';
import { format } from 'date-fns';
import type { Habit, HabitCompletion } from '../types/habit';
import { habitsService, completionsService } from '../lib/supabaseData';
import {
  dbHabitToHabit,
  dbCompletionToCompletion,
  habitToDbInsert,
} from '../types/database';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

// Helper to get current month in YYYY-MM format
export const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Habit CRUD operations
  addHabit: (
    habit: Omit<Habit, 'id' | 'createdAt' | 'month'>,
    month?: string
  ) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  carryOverHabit: (habitId: string, toMonth: string) => Promise<void>;

  // Month-specific queries (synchronous - read from local state)
  getHabitsForMonth: (month: string) => Habit[];
  getCurrentMonthHabits: () => Habit[];
  hasHabitsForMonth: (month: string) => boolean;

  // Completion operations
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  setNumericValue: (
    habitId: string,
    date: string,
    value: number
  ) => Promise<void>;
  getNumericValue: (habitId: string, date: string) => number | undefined;
  updateCompletion: (
    habitId: string,
    date: string,
    data: Partial<HabitCompletion>
  ) => Promise<void>;
  getCompletionsForDate: (date: string) => HabitCompletion[];
  getCompletionsForHabit: (habitId: string) => HabitCompletion[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
}

export const useHabitStore = create<HabitState>()((set, get) => ({
  habits: [],
  completions: [],
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, error: null });
    try {
      const [dbHabits, dbCompletions] = await Promise.all([
        habitsService.fetchAll(),
        completionsService.fetchAll(),
      ]);

      set({
        habits: dbHabits.map(dbHabitToHabit),
        completions: dbCompletions.map(dbCompletionToCompletion),
        loading: false,
        initialized: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load habits';
      set({ error: message, loading: false });
      toast.error('Failed to load habits');
    }
  },

  reset: () => {
    set({
      habits: [],
      completions: [],
      initialized: false,
      error: null,
      loading: false,
    });
  },

  addHabit: async (habit, month) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const newHabit: Omit<Habit, 'id'> = {
      ...habit,
      createdAt: new Date().toISOString(),
      month: month || getCurrentMonth(),
    };

    try {
      const dbHabit = await habitsService.create(habitToDbInsert(newHabit, userId));
      const createdHabit = dbHabitToHabit(dbHabit);

      set((state) => ({
        habits: [...state.habits, createdHabit],
      }));
    } catch (error) {
      toast.error('Failed to add habit');
      throw error;
    }
  },

  updateHabit: async (id, updates) => {
    // Optimistic update
    const previousHabits = get().habits;
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      ),
    }));

    try {
      await habitsService.update(id, {
        name: updates.name,
        description: updates.description ?? null,
        icon: updates.icon ?? null,
        color: updates.color,
        category: updates.category,
        type: updates.type,
        reminder_time: updates.reminderTime ?? null,
        reminder_enabled: updates.reminderEnabled,
        archived: updates.archived,
        unit: updates.unit ?? null,
        target_value: updates.targetValue ?? null,
        min_value: updates.minValue ?? null,
        max_value: updates.maxValue ?? null,
      });
    } catch (error) {
      // Revert on error
      set({ habits: previousHabits });
      toast.error('Failed to update habit');
      throw error;
    }
  },

  deleteHabit: async (id) => {
    // Optimistic update
    const previousState = {
      habits: get().habits,
      completions: get().completions,
    };

    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
      completions: state.completions.filter((c) => c.habitId !== id),
    }));

    try {
      await habitsService.delete(id);
    } catch (error) {
      // Revert on error
      set(previousState);
      toast.error('Failed to delete habit');
      throw error;
    }
  },

  archiveHabit: async (id) => {
    // Optimistic update
    const previousHabits = get().habits;
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, archived: true } : habit
      ),
    }));

    try {
      await habitsService.update(id, { archived: true });
    } catch (error) {
      // Revert on error
      set({ habits: previousHabits });
      toast.error('Failed to archive habit');
      throw error;
    }
  },

  carryOverHabit: async (habitId, toMonth) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newHabit: Omit<Habit, 'id'> = {
      ...habit,
      createdAt: new Date().toISOString(),
      month: toMonth,
      archived: false,
    };

    try {
      const dbHabit = await habitsService.create(habitToDbInsert(newHabit, userId));
      const createdHabit = dbHabitToHabit(dbHabit);

      set((state) => ({
        habits: [...state.habits, createdHabit],
      }));
    } catch (error) {
      toast.error('Failed to carry over habit');
      throw error;
    }
  },

  // Query methods - synchronous, read from local state
  getHabitsForMonth: (month) => {
    return get().habits.filter((h) => h.month === month);
  },

  getCurrentMonthHabits: () => {
    const currentMonth = getCurrentMonth();
    return get().habits.filter((h) => h.month === currentMonth);
  },

  hasHabitsForMonth: (month) => {
    return get().habits.some((h) => h.month === month);
  },

  toggleCompletion: async (habitId, date) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const { completions } = get();
    const existing = completions.find(
      (c) => c.habitId === habitId && c.date === date
    );

    const newCompleted = existing ? !existing.completed : true;
    const completedAt = newCompleted ? new Date().toISOString() : undefined;

    // Optimistic update
    if (existing) {
      set((state) => ({
        completions: state.completions.map((c) =>
          c.habitId === habitId && c.date === date
            ? { ...c, completed: newCompleted, completedAt }
            : c
        ),
      }));
    } else {
      const newCompletion: HabitCompletion = {
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      set((state) => ({
        completions: [...state.completions, newCompletion],
      }));
    }

    // Sync to Supabase
    try {
      await completionsService.upsert({
        user_id: userId,
        habit_id: habitId,
        date,
        completed: newCompleted,
        completed_at: completedAt ?? null,
        note: existing?.note ?? null,
        value: existing?.value ?? null,
      });
    } catch (error) {
      // Reload from server on error
      await get().initialize();
      toast.error('Failed to save completion');
    }
  },

  setNumericValue: async (habitId, date, value) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const { completions } = get();
    const existing = completions.find(
      (c) => c.habitId === habitId && c.date === date
    );

    const completedAt = new Date().toISOString();

    // Optimistic update
    if (existing) {
      set((state) => ({
        completions: state.completions.map((c) =>
          c.habitId === habitId && c.date === date
            ? { ...c, value, completed: true, completedAt }
            : c
        ),
      }));
    } else {
      const newCompletion: HabitCompletion = {
        habitId,
        date,
        completed: true,
        completedAt,
        value,
      };
      set((state) => ({
        completions: [...state.completions, newCompletion],
      }));
    }

    // Sync to Supabase
    try {
      await completionsService.upsert({
        user_id: userId,
        habit_id: habitId,
        date,
        completed: true,
        completed_at: completedAt,
        note: existing?.note ?? null,
        value,
      });
    } catch (error) {
      // Reload from server on error
      await get().initialize();
      toast.error('Failed to save value');
    }
  },

  getNumericValue: (habitId, date) => {
    const completion = get().completions.find(
      (c) => c.habitId === habitId && c.date === date
    );
    return completion?.value;
  },

  updateCompletion: async (habitId, date, data) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const previousCompletions = get().completions;
    const existing = previousCompletions.find(
      (c) => c.habitId === habitId && c.date === date
    );

    // Optimistic update
    set((state) => ({
      completions: state.completions.map((c) =>
        c.habitId === habitId && c.date === date ? { ...c, ...data } : c
      ),
    }));

    // Sync to Supabase
    try {
      const merged = { ...existing, ...data };
      await completionsService.upsert({
        user_id: userId,
        habit_id: habitId,
        date,
        completed: merged.completed ?? false,
        completed_at: merged.completedAt ?? null,
        note: merged.note ?? null,
        value: merged.value ?? null,
      });
    } catch (error) {
      set({ completions: previousCompletions });
      toast.error('Failed to update completion');
    }
  },

  getCompletionsForDate: (date) => {
    return get().completions.filter((c) => c.date === date);
  },

  getCompletionsForHabit: (habitId) => {
    return get().completions.filter((c) => c.habitId === habitId);
  },

  isHabitCompletedOnDate: (habitId, date) => {
    const completion = get().completions.find(
      (c) => c.habitId === habitId && c.date === date
    );
    return completion?.completed ?? false;
  },
}));
