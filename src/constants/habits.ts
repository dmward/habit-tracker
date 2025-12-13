import { HabitCategory, type HabitTemplate } from '../types/habit';

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Health
  {
    name: 'Drink 8 Glasses of Water',
    description: 'Stay hydrated throughout the day',
    icon: '💧',
    category: HabitCategory.HEALTH,
    suggestedColor: '#3B82F6',
  },
  {
    name: 'Take Vitamins',
    description: 'Daily vitamin and supplement routine',
    icon: '💊',
    category: HabitCategory.HEALTH,
    suggestedColor: '#10B981',
  },
  {
    name: 'Sleep 8 Hours',
    description: 'Get a full night of quality sleep',
    icon: '😴',
    category: HabitCategory.HEALTH,
    suggestedColor: '#6366F1',
  },
  {
    name: 'Eat Vegetables',
    description: 'Include vegetables in your meals',
    icon: '🥗',
    category: HabitCategory.HEALTH,
    suggestedColor: '#22C55E',
  },

  // Fitness
  {
    name: 'Exercise 30 Minutes',
    description: 'Physical activity for fitness',
    icon: '💪',
    category: HabitCategory.FITNESS,
    suggestedColor: '#EF4444',
  },
  {
    name: 'Morning Run',
    description: 'Start the day with a refreshing run',
    icon: '🏃',
    category: HabitCategory.FITNESS,
    suggestedColor: '#F97316',
  },
  {
    name: 'Yoga Practice',
    description: '20 minutes of yoga and stretching',
    icon: '🧘',
    category: HabitCategory.FITNESS,
    suggestedColor: '#A855F7',
  },
  {
    name: '10,000 Steps',
    description: 'Walk at least 10,000 steps daily',
    icon: '👟',
    category: HabitCategory.FITNESS,
    suggestedColor: '#14B8A6',
  },

  // Mindfulness
  {
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness practice',
    icon: '🧘‍♀️',
    category: HabitCategory.MINDFULNESS,
    suggestedColor: '#8B5CF6',
  },
  {
    name: 'Gratitude Journal',
    description: 'Write down 3 things you\'re grateful for',
    icon: '📝',
    category: HabitCategory.MINDFULNESS,
    suggestedColor: '#EC4899',
  },
  {
    name: 'Deep Breathing',
    description: '5 minutes of breathing exercises',
    icon: '🌬️',
    category: HabitCategory.MINDFULNESS,
    suggestedColor: '#06B6D4',
  },
  {
    name: 'No Phone Before Bed',
    description: 'Avoid screens 1 hour before sleep',
    icon: '📵',
    category: HabitCategory.MINDFULNESS,
    suggestedColor: '#64748B',
  },

  // Productivity
  {
    name: 'Plan Tomorrow',
    description: 'Review and plan the next day',
    icon: '📅',
    category: HabitCategory.PRODUCTIVITY,
    suggestedColor: '#0EA5E9',
  },
  {
    name: 'Focus Work Session',
    description: '2 hours of deep, focused work',
    icon: '⏰',
    category: HabitCategory.PRODUCTIVITY,
    suggestedColor: '#F59E0B',
  },
  {
    name: 'Inbox Zero',
    description: 'Clear and organize your inbox',
    icon: '📧',
    category: HabitCategory.PRODUCTIVITY,
    suggestedColor: '#84CC16',
  },
  {
    name: 'Review Goals',
    description: 'Check progress on weekly goals',
    icon: '🎯',
    category: HabitCategory.PRODUCTIVITY,
    suggestedColor: '#DC2626',
  },

  // Learning
  {
    name: 'Read 30 Pages',
    description: 'Daily reading habit',
    icon: '📚',
    category: HabitCategory.LEARNING,
    suggestedColor: '#7C3AED',
  },
  {
    name: 'Learn New Language',
    description: '15 minutes of language practice',
    icon: '🌍',
    category: HabitCategory.LEARNING,
    suggestedColor: '#2563EB',
  },
  {
    name: 'Online Course',
    description: 'Complete one lesson',
    icon: '🎓',
    category: HabitCategory.LEARNING,
    suggestedColor: '#059669',
  },
  {
    name: 'Practice Coding',
    description: 'Work on programming skills',
    icon: '💻',
    category: HabitCategory.LEARNING,
    suggestedColor: '#0891B2',
  },

  // Social
  {
    name: 'Call a Friend',
    description: 'Connect with someone you care about',
    icon: '📞',
    category: HabitCategory.SOCIAL,
    suggestedColor: '#EC4899',
  },
  {
    name: 'Family Time',
    description: 'Quality time with family',
    icon: '👨‍👩‍👧‍👦',
    category: HabitCategory.SOCIAL,
    suggestedColor: '#F43F5E',
  },
  {
    name: 'Send a Message',
    description: 'Reach out to someone',
    icon: '💬',
    category: HabitCategory.SOCIAL,
    suggestedColor: '#8B5CF6',
  },

  // Creative
  {
    name: 'Write 500 Words',
    description: 'Daily writing practice',
    icon: '✍️',
    category: HabitCategory.CREATIVE,
    suggestedColor: '#F59E0B',
  },
  {
    name: 'Draw or Sketch',
    description: '20 minutes of drawing',
    icon: '🎨',
    category: HabitCategory.CREATIVE,
    suggestedColor: '#EAB308',
  },
  {
    name: 'Play Instrument',
    description: 'Practice music for 30 minutes',
    icon: '🎵',
    category: HabitCategory.CREATIVE,
    suggestedColor: '#A855F7',
  },
  {
    name: 'Photography',
    description: 'Take creative photos',
    icon: '📸',
    category: HabitCategory.CREATIVE,
    suggestedColor: '#6366F1',
  },
];

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  [HabitCategory.HEALTH]: '#10B981',
  [HabitCategory.FITNESS]: '#EF4444',
  [HabitCategory.PRODUCTIVITY]: '#0EA5E9',
  [HabitCategory.MINDFULNESS]: '#8B5CF6',
  [HabitCategory.LEARNING]: '#7C3AED',
  [HabitCategory.SOCIAL]: '#EC4899',
  [HabitCategory.CREATIVE]: '#F59E0B',
  [HabitCategory.CUSTOM]: '#64748B',
};

export const CATEGORY_LABELS: Record<HabitCategory, string> = {
  [HabitCategory.HEALTH]: 'Health',
  [HabitCategory.FITNESS]: 'Fitness',
  [HabitCategory.PRODUCTIVITY]: 'Productivity',
  [HabitCategory.MINDFULNESS]: 'Mindfulness',
  [HabitCategory.LEARNING]: 'Learning',
  [HabitCategory.SOCIAL]: 'Social',
  [HabitCategory.CREATIVE]: 'Creative',
  [HabitCategory.CUSTOM]: 'Custom',
};
