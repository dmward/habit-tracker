import { format, parseISO, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { Habit, HabitCompletion } from '../../types/habit';
import Card from '../common/Card';

interface NumericHabitChartProps {
  habit: Habit;
  completions: HabitCompletion[];
  days?: number;
  chartType?: 'line' | 'bar';
}

export default function NumericHabitChart({
  habit,
  completions,
  days = 30,
  chartType = 'line',
}: NumericHabitChartProps) {
  // Generate array of last N days
  const dateRange = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return format(date, 'yyyy-MM-dd');
  });

  // Build chart data: only include days where value was logged
  const chartData = dateRange
    .map((date) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === date
      );
      const value = completion?.value;

      // Only return data point if value was logged (including 0)
      if (value !== undefined) {
        return {
          date: format(parseISO(date), 'MMM d'),
          fullDate: date,
          value: value,
          target: habit.targetValue,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const hasData = chartData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {data.date}
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Value: {data.value} {habit.unit}
          </p>
          {habit.targetValue !== undefined && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Target: {habit.targetValue} {habit.unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>{habit.icon}</span>
          <span>{habit.name}</span>
        </h3>
        {habit.unit && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tracking: {habit.unit}
          </p>
        )}
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
                label={{
                  value: habit.unit || 'Value',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {habit.targetValue !== undefined && (
                <ReferenceLine
                  y={habit.targetValue}
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Target',
                    position: 'right',
                    style: { fontSize: 12, fill: '#9CA3AF' },
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                name="Value"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ fill: '#6366F1', r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
                label={{
                  value: habit.unit || 'Value',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {habit.targetValue !== undefined && (
                <ReferenceLine
                  y={habit.targetValue}
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Target',
                    position: 'right',
                    style: { fontSize: 12, fill: '#9CA3AF' },
                  }}
                />
              )}
              <Bar
                dataKey="value"
                name="Value"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No data logged in the last {days} days
          </p>
        </div>
      )}
    </Card>
  );
}
