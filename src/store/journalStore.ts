import { create } from 'zustand';
import type { JournalEntry } from '../types/journal';
import { journalService } from '../lib/supabaseData';
import { dbJournalToJournal } from '../types/database';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Get entry for a specific date
  getEntryForDate: (date: string) => JournalEntry | undefined;

  // Save or update entry (auto-creates if doesn't exist)
  saveEntry: (date: string, content: string) => Promise<void>;

  // Delete entry for a specific date
  deleteEntry: (date: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>()((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, error: null });
    try {
      const dbEntries = await journalService.fetchAll();
      set({
        entries: dbEntries.map(dbJournalToJournal),
        loading: false,
        initialized: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load journal';
      set({ error: message, loading: false });
      toast.error('Failed to load journal entries');
    }
  },

  reset: () => {
    set({
      entries: [],
      initialized: false,
      error: null,
      loading: false,
    });
  },

  getEntryForDate: (date) => {
    return get().entries.find((e) => e.date === date);
  },

  saveEntry: async (date, content) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const existing = get().entries.find((e) => e.date === date);
    const now = new Date().toISOString();

    // Optimistic update
    if (existing) {
      set((state) => ({
        entries: state.entries.map((e) =>
          e.date === date ? { ...e, content, updatedAt: now } : e
        ),
      }));
    } else {
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

    // Sync to Supabase
    try {
      await journalService.upsert({
        user_id: userId,
        date,
        content,
      });
    } catch (error) {
      // Reload from server on error
      await get().initialize();
      toast.error('Failed to save journal entry');
    }
  },

  deleteEntry: async (date) => {
    const previousEntries = get().entries;

    // Optimistic update
    set((state) => ({
      entries: state.entries.filter((e) => e.date !== date),
    }));

    // Sync to Supabase
    try {
      await journalService.delete(date);
    } catch (error) {
      set({ entries: previousEntries });
      toast.error('Failed to delete journal entry');
    }
  },
}));
