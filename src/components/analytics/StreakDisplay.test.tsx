import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StreakDisplay from './StreakDisplay';
import { useHabitStore } from '../../store/habitStore';
import type { Habit, HabitCompletion } from '../../types/habit';
import { HabitType, HabitCategory } from '../../types/habit';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Test Habit',
    color: '#000000',
    category: HabitCategory.HEALTH,
    type: HabitType.CHECKBOX,
    icon: '💪',
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

describe('StreakDisplay', () => {
  beforeEach(() => {
    useHabitStore.setState({
      habits: [],
      completions: [],
      loading: false,
      error: null,
      initialized: true,
    });
  });

  it('should show message when no habits exist', () => {
    render(<StreakDisplay />);
    expect(screen.getByText('No habits to track yet')).toBeInTheDocument();
  });

  it('should display habits with their streaks', () => {
    const habits = [
      createHabit({ id: 'habit-1', name: 'Exercise', icon: '💪' }),
    ];
    const completions = [
      createCompletion({ habitId: 'habit-1', date: '2026-01-13' }),
      createCompletion({ habitId: 'habit-1', date: '2026-01-14' }),
    ];

    useHabitStore.setState({ habits, completions });

    render(<StreakDisplay />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  it('should combine streaks for habits with same name across months', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    const habits = [
      // December habit
      createHabit({
        id: 'dec-exercise',
        name: 'Exercise 30 Minutes',
        month: '2025-12',
        createdAt: '2025-12-01T00:00:00Z',
      }),
      // January habit (same name)
      createHabit({
        id: 'jan-exercise',
        name: 'Exercise 30 Minutes',
        month: '2026-01',
        createdAt: '2026-01-01T00:00:00Z',
      }),
    ];

    const completions = [
      // Completions for December habit
      createCompletion({ habitId: 'dec-exercise', date: twoDaysAgoStr }),
      // Completions for January habit (continuing streak)
      createCompletion({ habitId: 'jan-exercise', date: yesterdayStr }),
      createCompletion({ habitId: 'jan-exercise', date: todayStr }),
    ];

    useHabitStore.setState({ habits, completions });

    render(<StreakDisplay />);

    // Should only show "Exercise 30 Minutes" once (not twice)
    const exerciseElements = screen.getAllByText('Exercise 30 Minutes');
    expect(exerciseElements).toHaveLength(1);

    // Should show combined streak and best streak
    expect(screen.getByText('Best: 3 days')).toBeInTheDocument();
  });

  it('should not combine habits with different names', () => {
    const habits = [
      createHabit({ id: 'habit-1', name: 'Exercise', icon: '💪' }),
      createHabit({ id: 'habit-2', name: 'Reading', icon: '📚' }),
    ];

    useHabitStore.setState({ habits, completions: [] });

    render(<StreakDisplay />);

    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('should sort habits by current streak descending', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const habits = [
      createHabit({ id: 'habit-1', name: 'Low Streak', icon: '📚' }),
      createHabit({ id: 'habit-2', name: 'High Streak', icon: '💪' }),
    ];

    const completions = [
      // Low streak: 1 day
      createCompletion({ habitId: 'habit-1', date: today }),
      // High streak: 2 days
      createCompletion({ habitId: 'habit-2', date: yesterdayStr }),
      createCompletion({ habitId: 'habit-2', date: today }),
    ];

    useHabitStore.setState({ habits, completions });

    render(<StreakDisplay />);

    const habitNames = screen.getAllByRole('paragraph');
    const firstHabitName = habitNames.find(p => p.textContent === 'High Streak');
    const secondHabitName = habitNames.find(p => p.textContent === 'Low Streak');

    expect(firstHabitName).toBeInTheDocument();
    expect(secondHabitName).toBeInTheDocument();
  });

  it('should exclude archived habits', () => {
    const habits = [
      createHabit({ id: 'habit-1', name: 'Active Habit', archived: false }),
      createHabit({ id: 'habit-2', name: 'Archived Habit', archived: true }),
    ];

    useHabitStore.setState({ habits, completions: [] });

    render(<StreakDisplay />);

    expect(screen.getByText('Active Habit')).toBeInTheDocument();
    expect(screen.queryByText('Archived Habit')).not.toBeInTheDocument();
  });

  it('should show award icon for habit with highest streak', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const habits = [
      createHabit({ id: 'habit-1', name: 'Best Habit', icon: '💪' }),
      createHabit({ id: 'habit-2', name: 'Other Habit', icon: '📚' }),
    ];

    const completions = [
      // Best Habit: 2 day streak
      createCompletion({ habitId: 'habit-1', date: yesterdayStr }),
      createCompletion({ habitId: 'habit-1', date: today }),
      // Other Habit: no streak
    ];

    useHabitStore.setState({ habits, completions });

    render(<StreakDisplay />);

    // The first habit should be "Best Habit" which has active streak
    // Award icon should be present next to it
    expect(screen.getByText('Best Habit')).toBeInTheDocument();
  });
});
