import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJournalStore } from './journalStore';
import { useAuthStore } from './authStore';

// Mock the auth store
vi.mock('./authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

// Mock the journal service
vi.mock('../lib/supabaseData', () => ({
  journalService: {
    fetchAll: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('journalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useJournalStore.setState({
      entries: [],
      loading: false,
      error: null,
      initialized: false,
    });

    // Mock authenticated user
    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: { id: 'test-user-id' },
    } as ReturnType<typeof useAuthStore.getState>);
  });

  describe('getEntryForDate', () => {
    it('should return undefined when no entry exists for date', () => {
      const { getEntryForDate } = useJournalStore.getState();
      const result = getEntryForDate('2024-01-15');
      expect(result).toBeUndefined();
    });

    it('should return the entry when it exists for date', () => {
      const testEntry = {
        date: '2024-01-15',
        content: 'Test content',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      useJournalStore.setState({ entries: [testEntry] });

      const { getEntryForDate } = useJournalStore.getState();
      const result = getEntryForDate('2024-01-15');

      expect(result).toEqual(testEntry);
    });

    it('should return correct entry when multiple entries exist', () => {
      const entries = [
        {
          date: '2024-01-14',
          content: 'Yesterday',
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z',
        },
        {
          date: '2024-01-15',
          content: 'Today',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      useJournalStore.setState({ entries });

      const { getEntryForDate } = useJournalStore.getState();
      const result = getEntryForDate('2024-01-15');

      expect(result?.content).toBe('Today');
    });
  });

  describe('saveEntry', () => {
    it('should return false when user is not authenticated', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        user: null,
      } as ReturnType<typeof useAuthStore.getState>);

      const { saveEntry } = useJournalStore.getState();
      const result = await saveEntry('2024-01-15', 'Test content');

      expect(result).toBe(false);
    });

    it('should add new entry to state when saving for new date', async () => {
      const { journalService } = await import('../lib/supabaseData');
      vi.mocked(journalService.upsert).mockResolvedValue({} as never);

      const { saveEntry } = useJournalStore.getState();
      await saveEntry('2024-01-15', 'New content');

      const { entries } = useJournalStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].date).toBe('2024-01-15');
      expect(entries[0].content).toBe('New content');
    });

    it('should update existing entry in state', async () => {
      const { journalService } = await import('../lib/supabaseData');
      vi.mocked(journalService.upsert).mockResolvedValue({} as never);

      // Add existing entry
      useJournalStore.setState({
        entries: [{
          date: '2024-01-15',
          content: 'Old content',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        }],
      });

      const { saveEntry } = useJournalStore.getState();
      await saveEntry('2024-01-15', 'Updated content');

      const { entries } = useJournalStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe('Updated content');
    });

    it('should return true on successful save', async () => {
      const { journalService } = await import('../lib/supabaseData');
      vi.mocked(journalService.upsert).mockResolvedValue({} as never);

      const { saveEntry } = useJournalStore.getState();
      const result = await saveEntry('2024-01-15', 'Test content');

      expect(result).toBe(true);
    });

    it('should return false and show error toast on save failure', async () => {
      const { journalService } = await import('../lib/supabaseData');
      vi.mocked(journalService.upsert).mockRejectedValue(new Error('Network error'));
      vi.mocked(journalService.fetchAll).mockResolvedValue([]);

      const toast = await import('react-hot-toast');

      const { saveEntry } = useJournalStore.getState();
      const result = await saveEntry('2024-01-15', 'Test content');

      expect(result).toBe(false);
      expect(toast.default.error).toHaveBeenCalledWith('Failed to save journal entry');
    });
  });

  describe('reset', () => {
    it('should clear all entries and reset state', () => {
      useJournalStore.setState({
        entries: [{ date: '2024-01-15', content: 'Test', createdAt: '', updatedAt: '' }],
        loading: true,
        error: 'Some error',
        initialized: true,
      });

      const { reset } = useJournalStore.getState();
      reset();

      const state = useJournalStore.getState();
      expect(state.entries).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.initialized).toBe(false);
    });
  });
});
