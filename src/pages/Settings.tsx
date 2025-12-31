import { useState } from 'react';
import { Bell, BellOff, Download, Upload, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useHabitStore } from '../store/habitStore';
import { useJournalStore } from '../store/journalStore';
import { useAuthStore } from '../store/authStore';
import { habitsService, completionsService, journalService, bulkService } from '../lib/supabaseData';
import { habitToDbInsert } from '../types/database';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { buildInfo } from '../buildInfo';

export default function Settings() {
  const { permission, requestPermission, isSupported } = useNotifications();
  const { habits, completions, initialize: initHabits } = useHabitStore();
  const { entries, initialize: initJournal } = useJournalStore();
  const { user } = useAuthStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
      journalEntries: entries,
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
    if (!user) {
      toast.error('You must be logged in to import data');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const importedHabits = data.habits || [];
          const importedCompletions = data.completions || [];
          const importedJournalEntries = data.journalEntries || [];

          // Map old habit IDs to new IDs
          const oldIdToNewId: Record<string, string> = {};

          // Import habits
          for (const habit of importedHabits) {
            const dbHabit = await habitsService.create(
              habitToDbInsert(habit, user.id)
            );
            oldIdToNewId[habit.id] = dbHabit.id;
          }

          // Import completions with mapped habit IDs
          for (const completion of importedCompletions) {
            const newHabitId = oldIdToNewId[completion.habitId];
            if (newHabitId) {
              await completionsService.upsert({
                user_id: user.id,
                habit_id: newHabitId,
                date: completion.date,
                completed: completion.completed,
                completed_at: completion.completedAt ?? null,
                note: completion.note ?? null,
                value: completion.value ?? null,
              });
            }
          }

          // Import journal entries
          for (const entry of importedJournalEntries) {
            await journalService.upsert({
              user_id: user.id,
              date: entry.date,
              content: entry.content,
            });
          }

          // Reload data from Supabase
          await Promise.all([initHabits(), initJournal()]);

          toast.success(
            `Imported ${importedHabits.length} habits, ${importedCompletions.length} completions, and ${importedJournalEntries.length} journal entries`
          );
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Failed to import data');
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const habitsWithReminders = habits.filter((h) => h.reminderEnabled && !h.archived);

  const handleResetAllData = async () => {
    if (!user) return;

    setIsResetting(true);
    try {
      await bulkService.deleteAllUserData();

      // Reset local stores
      useHabitStore.getState().reset();
      useJournalStore.getState().reset();

      // Reinitialize to get empty state
      await Promise.all([initHabits(), initJournal()]);

      toast.success('All data deleted successfully');
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to delete data');
    } finally {
      setIsResetting(false);
    }
  };

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
          <Button
            variant="outline"
            onClick={handleImportData}
            disabled={isImporting}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </Card>

      {/* App Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About
        </h2>
        <div className="space-y-4">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Habit Tracker</strong> - Build better habits, one day at a time
            </p>
            <p>Your data is securely stored in the cloud and synced across devices.</p>
          </div>

          {/* User Stats */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Stats
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>Total Habits: {habits.length}</p>
              <p>Total Check-ins: {completions.filter((c) => c.completed).length}</p>
              <p>Total Journal Entries: {entries.length}</p>
            </div>
          </div>

          {/* Build Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Build Information
            </p>
            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500 font-mono">
              <p>Version: {buildInfo.version}</p>
              <p>Build ID: {buildInfo.buildId}</p>
              <p>
                Build Date: {format(new Date(buildInfo.buildDate), 'MMM d, yyyy h:mm a')}
              </p>
              <p>Branch: {buildInfo.gitBranch}</p>
              {buildInfo.environment !== 'production' && (
                <p className="text-yellow-600 dark:text-yellow-500">
                  Environment: {buildInfo.environment}
                </p>
              )}
              <p className="break-all">
                Supabase: {import.meta.env.VITE_SUPABASE_URL}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Permanently delete all your habits, completions, and journal entries. This
          action cannot be undone.
        </p>
        {!showResetConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            className="gap-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Are you sure? This will delete:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>{habits.length} habit(s)</li>
              <li>{completions.filter((c) => c.completed).length} completion(s)</li>
              <li>{entries.length} journal entry/entries</li>
            </ul>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleResetAllData}
                disabled={isResetting}
                className="border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600"
              >
                {isResetting ? 'Deleting...' : 'Yes, Delete Everything'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
