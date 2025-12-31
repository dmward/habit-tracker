import { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { useDateSelection } from '../../hooks/useDateSelection';
import { useJournalStore } from '../../store/journalStore';
import { useDebounce } from '../../hooks/useDebounce';
import Card from '../common/Card';

export default function MomentCard() {
  const { selectedDate } = useDateSelection();
  const { getEntryForDate, saveEntry, initialized } = useJournalStore();

  const existingEntry = getEntryForDate(selectedDate);
  const [content, setContent] = useState(existingEntry?.content || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Track which date the current content belongs to
  const contentDateRef = useRef(selectedDate);

  // Abort controller to cancel pending saves when switching dates
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce content changes - waits 1 second after user stops typing
  const debouncedContent = useDebounce(content, 1000);

  // Stable reference to saveEntry to avoid unnecessary effect reruns
  const saveEntryRef = useRef(saveEntry);
  saveEntryRef.current = saveEntry;

  // Auto-save when debounced content changes
  useEffect(() => {
    // Cancel any pending save operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Only save if the debounced content is for the current date
    // This prevents saving stale content to the wrong date when switching days
    if (contentDateRef.current !== selectedDate) {
      return;
    }

    const entry = getEntryForDate(selectedDate);

    // Only save if content is different from what's stored
    if (debouncedContent === entry?.content) {
      return;
    }

    // Don't save empty content for entries that don't exist yet
    if (!debouncedContent.trim() && !entry) {
      return;
    }

    // Create new abort controller for this save operation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const performSave = async () => {
      // Check if aborted before starting
      if (controller.signal.aborted) return;

      setSaveStatus('saving');

      try {
        const success = await saveEntryRef.current(selectedDate, debouncedContent);

        // Check if aborted after save completes (user may have switched dates)
        if (controller.signal.aborted) return;

        if (success) {
          setSaveStatus('saved');
          // Clear "saved" indicator after 2 seconds
          const timer = setTimeout(() => {
            if (!controller.signal.aborted) {
              setSaveStatus('idle');
            }
          }, 2000);
          // Cleanup timer on abort
          controller.signal.addEventListener('abort', () => clearTimeout(timer));
        } else {
          setSaveStatus('error');
          // Clear error status after 3 seconds
          setTimeout(() => {
            if (!controller.signal.aborted) {
              setSaveStatus('idle');
            }
          }, 3000);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSaveStatus('error');
        }
      }
    };

    performSave();

    // Cleanup: abort the save operation if effect reruns or unmounts
    return () => {
      controller.abort();
    };
  }, [debouncedContent, selectedDate, getEntryForDate]);

  // Update local state when date changes
  useEffect(() => {
    // Cancel any pending save from the previous date
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const entry = getEntryForDate(selectedDate);
    setContent(entry?.content || '');
    // CRITICAL: Update contentDateRef when loading content for a new date
    // This ensures the save effect knows this content belongs to the new date
    contentDateRef.current = selectedDate;
    setSaveStatus('idle');
  }, [selectedDate, getEntryForDate]);

  // Update content and track which date it belongs to
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    contentDateRef.current = selectedDate;
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
        {saveStatus === 'error' && (
          <span className="text-xs text-red-600 dark:text-red-400">
            Failed to save
          </span>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        disabled={!initialized}
        placeholder={initialized ? "What happened today? Any thoughts, feelings, or memorable moments worth remembering..." : "Loading..."}
        className="w-full min-h-[150px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
