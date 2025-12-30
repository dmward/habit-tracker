import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { useJournalStore } from '../../store/journalStore';
import {
  hasLocalStorageData,
  migrateLocalStorageToSupabase,
  clearLocalStorageData,
} from '../../lib/dataMigration';
import Button from './Button';
import Card from './Card';
import toast from 'react-hot-toast';

export default function MigrationPrompt() {
  const { user } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    // Check for localStorage data when user logs in
    if (user && hasLocalStorageData()) {
      setShowPrompt(true);
    }
  }, [user]);

  const handleMigrate = async () => {
    if (!user) return;

    setMigrating(true);

    try {
      const result = await migrateLocalStorageToSupabase(user.id);

      if (result.success) {
        toast.success(
          `Migrated ${result.migratedHabits} habits, ${result.migratedCompletions} completions, and ${result.migratedJournalEntries} journal entries`
        );

        // Reload data from Supabase
        await Promise.all([
          useHabitStore.getState().initialize(),
          useJournalStore.getState().initialize(),
        ]);
      } else {
        toast.error('Migration had some errors. Check console for details.');
        console.error('Migration errors:', result.errors);
      }
    } catch (error) {
      toast.error('Migration failed');
      console.error('Migration error:', error);
    }

    setShowPrompt(false);
    setMigrating(false);
  };

  const handleSkip = () => {
    clearLocalStorageData();
    setShowPrompt(false);
    toast('Local data cleared. Starting fresh.');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Migrate Your Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We found existing habit data on this device. Would you like to migrate
          it to your account so it syncs across devices?
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleSkip}
            disabled={migrating}
            className="flex-1"
          >
            Start Fresh
          </Button>
          <Button
            variant="primary"
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1"
          >
            {migrating ? 'Migrating...' : 'Migrate Data'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
