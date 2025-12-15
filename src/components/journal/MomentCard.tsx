import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useDateSelection } from '../../hooks/useDateSelection';
import { useJournalStore } from '../../store/journalStore';
import { useDebounce } from '../../hooks/useDebounce';
import Card from '../common/Card';

export default function MomentCard() {
  const { selectedDate } = useDateSelection();
  const { getEntryForDate, saveEntry } = useJournalStore();

  const existingEntry = getEntryForDate(selectedDate);
  const [content, setContent] = useState(existingEntry?.content || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Debounce content changes - waits 1 second after user stops typing
  const debouncedContent = useDebounce(content, 1000);

  // Auto-save when debounced content changes
  useEffect(() => {
    const entry = getEntryForDate(selectedDate);

    // Only save if content is different from what's stored
    if (debouncedContent !== entry?.content) {
      setSaveStatus('saving');
      saveEntry(selectedDate, debouncedContent);
      setSaveStatus('saved');

      // Clear "saved" indicator after 2 seconds
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [debouncedContent, selectedDate]);

  // Update local state when date changes
  useEffect(() => {
    const entry = getEntryForDate(selectedDate);
    setContent(entry?.content || '');
    setSaveStatus('idle');
  }, [selectedDate]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Memorable Moments
          </h3>
        </div>
        {saveStatus === 'saving' && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-600 dark:text-green-400">
            ✓ Saved
          </span>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What happened today? Any thoughts, feelings, or memorable moments worth remembering..."
        className="w-full min-h-[150px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        aria-label="Daily journal entry"
      />

      {content && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {content.length} characters
        </div>
      )}
    </Card>
  );
}
