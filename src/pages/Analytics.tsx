import { useState } from 'react';
import { format } from 'date-fns';
import { useHabitStore } from '../store/habitStore';
import { HabitType } from '../types/habit';
import StatsOverview from '../components/analytics/StatsOverview';
import CompletionChart from '../components/analytics/CompletionChart';
import StreakDisplay from '../components/analytics/StreakDisplay';
import NumericHabitChart from '../components/analytics/NumericHabitChart';
import Button from '../components/common/Button';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const { getCurrentMonthHabits, completions } = useHabitStore();

  const currentMonthHabits = getCurrentMonthHabits();
  const monthName = format(new Date(), 'MMMM yyyy');

  // Filter numeric habits from current month (active only)
  const numericHabits = currentMonthHabits.filter(
    (h) => h.type === HabitType.NUMERIC && !h.archived
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Statistics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {monthName}
          </p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {currentMonthHabits.length > 0 ? (
        <>
          {/* Overview Stats */}
          <StatsOverview />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-end gap-2">
                <Button
                  variant={chartType === 'line' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </Button>
              </div>
              <CompletionChart days={timeRange} chartType={chartType} />
            </div>
            <div>
              <StreakDisplay />
            </div>
          </div>

          {/* Numeric Habit Value Charts */}
          {numericHabits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Numeric Habit Trends
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {numericHabits.map((habit) => (
                  <NumericHabitChart
                    key={habit.id}
                    habit={habit}
                    completions={completions}
                    days={timeRange}
                    chartType={chartType}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No habits for this month yet. Add some habits to see your analytics!
          </p>
        </div>
      )}
    </div>
  );
}
