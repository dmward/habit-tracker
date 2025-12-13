import { useState } from 'react';
import StatsOverview from '../components/analytics/StatsOverview';
import CompletionChart from '../components/analytics/CompletionChart';
import StreakDisplay from '../components/analytics/StreakDisplay';
import Button from '../components/common/Button';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics & Statistics</h1>
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
    </div>
  );
}
