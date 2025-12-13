import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import type { Habit, HabitCompletion } from '../types/habit';

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];

  // Habit CRUD operations
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;

  // Completion operations
  toggleCompletion: (habitId: string, date: string) => void;
  updateCompletion: (habitId: string, date: string, data: Partial<HabitCompletion>) => void;
  getCompletionsForDate: (date: string) => HabitCompletion[];
  getCompletionsForHabit: (habitId: string) => HabitCompletion[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],

      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
          completions: state.completions.filter((c) => c.habitId !== id),
        }));
      },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, archived: true } : habit
          ),
        }));
      },

      toggleCompletion: (habitId, date) => {
        const { completions } = get();
        const existing = completions.find(
          (c) => c.habitId === habitId && c.date === date
        );

        if (existing) {
          // Toggle the existing completion
          set((state) => ({
            completions: state.completions.map((c) =>
              c.habitId === habitId && c.date === date
                ? {
                    ...c,
                    completed: !c.completed,
                    completedAt: !c.completed ? new Date().toISOString() : undefined,
                  }
                : c
            ),
          }));
        } else {
          // Create new completion
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
      },

      updateCompletion: (habitId, date, data) => {
        set((state) => ({
          completions: state.completions.map((c) =>
            c.habitId === habitId && c.date === date ? { ...c, ...data } : c
          ),
        }));
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
    }),
    {
      name: 'habit-tracker-storage',
      version: 1,
    }
  )
);
