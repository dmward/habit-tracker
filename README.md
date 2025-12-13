# Habit Tracker

A modern, feature-rich habit tracking web application built with React, TypeScript, and Tailwind CSS.

## Features

✅ **Daily Check-ins** - Track your habits with an intuitive daily view
📊 **Analytics & Statistics** - View completion rates, streaks, and trends
📝 **Multiple Habits** - Track unlimited habits across different categories
🔔 **Reminders** - Get browser notifications for your habits
📱 **Responsive Design** - Works beautifully on desktop and mobile
🌙 **Dark Mode** - Easy on the eyes with automatic dark mode support
💾 **Local Storage** - All data stored locally, no account needed
📤 **Export/Import** - Backup and restore your data anytime

## Tech Stack

- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts** for data visualization
- **date-fns** for date manipulation
- **Lucide React** for icons
- **React Router** for navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Usage

### Adding Habits

1. Click "Browse Templates" to choose from predefined habits, or
2. Click "Create Custom" to create your own habit with:
   - Custom name and description
   - Icon and color
   - Category
   - Optional daily reminder

### Daily Check-ins

- View all active habits on the Dashboard
- Click on any habit to mark it as complete
- See your progress with a visual completion percentage
- Get a celebration message when you complete all habits!

### Analytics

- View overall statistics (active habits, completion rate, best streak)
- See completion trends with interactive charts
- Track current and longest streaks for each habit
- Switch between 7-day, 30-day, and 90-day views

### Settings

- Enable browser notifications for habit reminders
- Export your data as JSON for backup
- Import previously exported data
- View app information and statistics

## Project Structure

```
habit-tracker/
├── src/
│   ├── components/
│   │   ├── analytics/    # Analytics components (charts, stats)
│   │   ├── common/       # Reusable UI components
│   │   ├── habits/       # Habit-related components
│   │   └── layout/       # Layout components (header, nav)
│   ├── constants/        # Habit templates and constants
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Data Storage

All data is stored in your browser's localStorage. Your habits and completion data are:
- Stored locally on your device
- Never sent to any server
- Persisted across browser sessions
- Exportable for backup

## Browser Notifications

To enable habit reminders:
1. Go to Settings
2. Click "Enable Notifications"
3. Grant permission when prompted
4. Set reminder times for individual habits

## Features in Detail

### Predefined Habit Templates

Choose from 25+ predefined habits across categories:
- **Health** - Water intake, vitamins, sleep
- **Fitness** - Exercise, running, yoga
- **Mindfulness** - Meditation, gratitude, breathing
- **Productivity** - Planning, focus work, inbox zero
- **Learning** - Reading, languages, courses
- **Social** - Calling friends, family time
- **Creative** - Writing, drawing, music

### Streak Tracking

- **Current Streak** - Consecutive days completed (including today/yesterday)
- **Longest Streak** - Your personal best
- **Visual Indicators** - See your progress at a glance

### Analytics

- **Completion Rate** - Percentage of days you've completed each habit
- **Trend Charts** - Line and bar charts showing your progress over time
- **Overall Stats** - Total habits, check-ins, and best streak

---

**Start building better habits today! 🎯**
