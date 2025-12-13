import { TrendingUp, Target, Flame, CheckCircle2 } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { calculateOverallStats } from '../../utils/statsCalculator';
import Card from '../common/Card';

export default function StatsOverview() {
  const { habits, completions } = useHabitStore();
  const stats = calculateOverallStats(habits, completions);

  const statCards = [
    {
      label: 'Active Habits',
      value: stats.activeHabits,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Completion Rate',
      value: `${Math.round(stats.averageCompletionRate)}%`,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Best Streak',
      value: stats.bestStreak?.streak || 0,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      subtitle: stats.bestStreak?.habitName,
    },
    {
      label: 'Total Check-ins',
      value: stats.totalCheckIns,
      icon: CheckCircle2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
