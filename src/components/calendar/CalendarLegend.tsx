import { Flame } from 'lucide-react';
import Card from '../common/Card';

export default function CalendarLegend() {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Legend
      </h3>

      {/* Completion Rate Scale */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Completion Rate
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-400">0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-400">1-24%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-400">25-49%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-400">50-74%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-400">75-99%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-200 dark:bg-green-900/50 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-400">100%</span>
        </div>
      </div>

      {/* Streak Indicator */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" fill="currentColor" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Active streak day
          </span>
        </div>
      </div>

      {/* Blue Ring */}
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded ring-2 ring-blue-500 bg-gray-100 dark:bg-gray-800" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Today
          </span>
        </div>
      </div>

      {/* Primary Ring */}
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded ring-2 ring-primary-600 bg-gray-100 dark:bg-gray-800" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Selected date
          </span>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Click any day to view and edit habits for that date
        </p>
      </div>
    </Card>
  );
}
