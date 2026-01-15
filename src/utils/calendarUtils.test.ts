import { describe, it, expect } from 'vitest';
import { getDayCompletionRate } from './calendarUtils';
import type { Habit, HabitCompletion } from '../types/habit';
import { HabitType, HabitCategory } from '../types/habit';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Test Habit',
    color: '#000000',
    category: HabitCategory.HEALTH,
    type: HabitType.CHECKBOX,
    reminderEnabled: false,
    createdAt: '2026-01-01T00:00:00Z',
    archived: false,
    month: '2026-01',
    ...overrides,
  };
}

function createCompletion(overrides: Partial<HabitCompletion> = {}): HabitCompletion {
  return {
    habitId: 'habit-1',
    date: '2026-01-15',
    completed: true,
    completedAt: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

describe('getDayCompletionRate', () => {
  it('should return 0 when there are no habits for the month', () => {
    const habits: Habit[] = [];
    const completions: HabitCompletion[] = [];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(0);
  });

  it('should return 0 when habits exist but none are completed', () => {
    const habits = [
      createHabit({ id: 'habit-1' }),
      createHabit({ id: 'habit-2' }),
    ];
    const completions: HabitCompletion[] = [];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(0);
  });

  it('should return correct percentage when some habits are completed', () => {
    const habits = [
      createHabit({ id: 'habit-1' }),
      createHabit({ id: 'habit-2' }),
      createHabit({ id: 'habit-3' }),
      createHabit({ id: 'habit-4' }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-15' }),
      createCompletion({ habitId: 'habit-2', date: '2026-01-15' }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(50); // 2 out of 4 = 50%
  });

  it('should return 100 when all habits are completed', () => {
    const habits = [
      createHabit({ id: 'habit-1' }),
      createHabit({ id: 'habit-2' }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-15' }),
      createCompletion({ habitId: 'habit-2', date: '2026-01-15' }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(100);
  });

  it('should only count habits for the relevant month', () => {
    const habits = [
      // January habits
      createHabit({ id: 'jan-1', month: '2026-01' }),
      createHabit({ id: 'jan-2', month: '2026-01' }),
      // December habits (should be ignored for January dates)
      createHabit({ id: 'dec-1', month: '2025-12' }),
      createHabit({ id: 'dec-2', month: '2025-12' }),
      createHabit({ id: 'dec-3', month: '2025-12' }),
    ];
    const completions = [
      createCompletion({ habitId: 'jan-1', date: '2026-01-15' }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    // Should be 1 out of 2 January habits = 50%
    // NOT 1 out of 5 total habits = 20%
    expect(result).toBe(50);
  });

  it('should exclude archived habits from the calculation', () => {
    const habits = [
      createHabit({ id: 'habit-1', archived: false }),
      createHabit({ id: 'habit-2', archived: false }),
      createHabit({ id: 'habit-3', archived: true }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-15' }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    // Should be 1 out of 2 active habits = 50%
    expect(result).toBe(50);
  });

  it('should count numeric habits as completed when they have a value', () => {
    const habits = [
      createHabit({ id: 'habit-1', type: HabitType.NUMERIC }),
      createHabit({ id: 'habit-2', type: HabitType.NUMERIC }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-15', completed: false, value: 5 }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(50);
  });

  it('should not count numeric habits without a value as completed', () => {
    const habits = [
      createHabit({ id: 'habit-1', type: HabitType.NUMERIC }),
      createHabit({ id: 'habit-2', type: HabitType.NUMERIC }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-15', completed: false, value: undefined }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(0);
  });

  it('should round completion rate to nearest integer', () => {
    const habits = [
      createHabit({ id: 'habit-1' }),
      createHabit({ id: 'habit-2' }),
      createHabit({ id: 'habit-3' }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-15' }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    // 1/3 = 33.33...% should round to 33%
    expect(result).toBe(33);
  });

  it('should return 0 when all habits for the month are archived', () => {
    const habits = [
      createHabit({ id: 'habit-1', archived: true }),
      createHabit({ id: 'habit-2', archived: true }),
    ];
    const completions: HabitCompletion[] = [];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(0);
  });

  it('should handle completions for dates without matching habits', () => {
    const habits = [
      createHabit({ id: 'habit-1', month: '2026-01' }),
    ];
    const completions = [
      // Completion for a different habit that doesn't exist
      createCompletion({ habitId: 'non-existent', date: '2026-01-15' }),
    ];

    const result = getDayCompletionRate('2026-01-15', habits, completions);

    expect(result).toBe(0);
  });
});
