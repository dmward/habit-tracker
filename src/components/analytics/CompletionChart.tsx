import { format, parseISO } from 'date-fns';
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
} from 'recharts';
import { useHabitStore } from '../../store/habitStore';
import { calculateTrendData } from '../../utils/statsCalculator';
import Card from '../common/Card';

interface CompletionChartProps {
  days?: number;
  chartType?: 'line' | 'bar';
}

export default function CompletionChart({ days = 30, chartType = 'line' }: CompletionChartProps) {
  const { habits, completions } = useHabitStore();
  const activeHabits = habits.filter((h) => !h.archived);

  const trendData = calculateTrendData(completions, activeHabits.length, days);

  const chartData = trendData.map((data) => ({
    date: format(parseISO(data.date), 'MMM d'),
    'Completion Rate': Math.round(data.completionRate),
    'Completed': data.completionCount,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Completed: {payload[0].payload.Completed}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Rate: {payload[0].payload['Completion Rate']}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {days}-Day Completion Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Completion Rate"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ fill: '#6366F1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Completed" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}
