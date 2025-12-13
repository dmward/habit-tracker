import { Bell, BellOff, Download, Upload } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useHabitStore } from '../store/habitStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Settings() {
  const { permission, requestPermission, isSupported } = useNotifications();
  const { habits, completions } = useHabitStore();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notifications enabled!');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleExportData = () => {
    const data = {
      habits,
      completions,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          localStorage.setItem('habit-tracker-storage', JSON.stringify({
            state: {
              habits: data.habits || [],
              completions: data.completions || [],
            },
            version: 1,
          }));
          toast.success('Data imported! Refreshing...');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          toast.error('Failed to import data');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const habitsWithReminders = habits.filter((h) => h.reminderEnabled && !h.archived);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            {permission === 'granted' ? (
              <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {!isSupported
                ? 'Notifications are not supported in your browser'
                : permission === 'granted'
                ? `You'll receive reminders for ${habitsWithReminders.length} habit(s)`
                : permission === 'denied'
                ? 'Notification permission was denied. Please enable it in your browser settings.'
                : 'Enable notifications to receive reminders for your habits'}
            </p>
            {isSupported && permission !== 'granted' && (
              <Button variant="primary" onClick={handleRequestPermission}>
                Enable Notifications
              </Button>
            )}
            {permission === 'granted' && habitsWithReminders.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Reminders:
                </p>
                {habitsWithReminders.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>{habit.icon}</span>
                    <span>{habit.name}</span>
                    <span className="text-xs">at {habit.reminderTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Export your data to create a backup or import previously exported data.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleImportData} className="gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
        </div>
      </Card>

      {/* App Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About
        </h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Habit Tracker</strong> - Build better habits, one day at a time
          </p>
          <p>
            All your data is stored locally in your browser. No account required!
          </p>
          <p>Total Habits: {habits.length}</p>
          <p>Total Check-ins: {completions.filter((c) => c.completed).length}</p>
        </div>
      </Card>
    </div>
  );
}
