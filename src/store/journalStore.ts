import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JournalEntry } from '../types/journal';

interface JournalState {
  entries: JournalEntry[];

  // Get entry for a specific date
  getEntryForDate: (date: string) => JournalEntry | undefined;

  // Save or update entry (auto-creates if doesn't exist)
  saveEntry: (date: string, content: string) => void;

  // Delete entry for a specific date
  deleteEntry: (date: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],

      getEntryForDate: (date) => {
        return get().entries.find(e => e.date === date);
      },

      saveEntry: (date, content) => {
        const existing = get().entries.find(e => e.date === date);
        const now = new Date().toISOString();

        if (existing) {
          // Update existing entry
          set((state) => ({
            entries: state.entries.map(e =>
              e.date === date
                ? { ...e, content, updatedAt: now }
                : e
            ),
          }));
        } else {
          // Create new entry
          const newEntry: JournalEntry = {
            date,
            content,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            entries: [...state.entries, newEntry],
          }));
        }
      },

      deleteEntry: (date) => {
        set((state) => ({
          entries: state.entries.filter(e => e.date !== date),
        }));
      },
    }),
    {
      name: 'journal-storage',
      version: 1,
    }
  )
);
