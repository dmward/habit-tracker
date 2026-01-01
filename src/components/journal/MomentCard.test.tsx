import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import MomentCard from './MomentCard';
import { useJournalStore } from '../../store/journalStore';

// Mock the hooks
vi.mock('../../hooks/useDateSelection', () => ({
  useDateSelection: vi.fn(() => ({
    selectedDate: '2024-01-15',
  })),
}));

vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('MomentCard', () => {
  const mockSaveEntry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset journal store with mock functions
    useJournalStore.setState({
      entries: [],
      loading: false,
      error: null,
      initialized: true,
      getEntryForDate: vi.fn(() => undefined),
      saveEntry: mockSaveEntry.mockResolvedValue(true),
      initialize: vi.fn(),
      reset: vi.fn(),
      deleteEntry: vi.fn(),
    });
  });

  it('should render the Memorable Moments heading', () => {
    render(<MomentCard />);
    expect(screen.getByText('Memorable Moments')).toBeInTheDocument();
  });

  it('should render textarea with placeholder when initialized', () => {
    render(<MomentCard />);
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('What happened today'));
  });

  it('should show "Loading..." placeholder when not initialized', () => {
    useJournalStore.setState({
      ...useJournalStore.getState(),
      initialized: false,
    });

    render(<MomentCard />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Loading...');
    expect(textarea).toBeDisabled();
  });

  it('should display existing entry content', () => {
    useJournalStore.setState({
      ...useJournalStore.getState(),
      entries: [{
        date: '2024-01-15',
        content: 'Existing journal content',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      }],
      getEntryForDate: vi.fn((date) => {
        if (date === '2024-01-15') {
          return {
            date: '2024-01-15',
            content: 'Existing journal content',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
          };
        }
        return undefined;
      }),
    });

    render(<MomentCard />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Existing journal content');
  });

  it('should allow typing in the textarea', async () => {
    const user = userEvent.setup();
    render(<MomentCard />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'New journal entry');

    expect(textarea).toHaveValue('New journal entry');
  });

  it('should display character count when content exists', async () => {
    const user = userEvent.setup();
    render(<MomentCard />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello');

    expect(screen.getByText('5 characters')).toBeInTheDocument();
  });

  it('should not display character count when content is empty', () => {
    render(<MomentCard />);
    expect(screen.queryByText(/characters/)).not.toBeInTheDocument();
  });

  it('should call saveEntry after typing (debounced)', async () => {
    const user = userEvent.setup();
    render(<MomentCard />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test content');

    // Since we mocked useDebounce to return value immediately,
    // saveEntry should be called
    await waitFor(() => {
      expect(mockSaveEntry).toHaveBeenCalledWith('2024-01-15', 'Test content');
    });
  });

  it('should show "Saving..." status while saving', async () => {
    // Make saveEntry return a promise that doesn't resolve immediately
    mockSaveEntry.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    );

    const user = userEvent.setup();
    render(<MomentCard />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test');

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('should show "Saved" status after successful save', async () => {
    mockSaveEntry.mockResolvedValue(true);

    const user = userEvent.setup();
    render(<MomentCard />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test content');

    await waitFor(() => {
      expect(screen.getByText('✓ Saved')).toBeInTheDocument();
    });
  });

  it('should show error status after failed save', async () => {
    mockSaveEntry.mockResolvedValue(false);

    const user = userEvent.setup();
    render(<MomentCard />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test content');

    await waitFor(() => {
      expect(screen.getByText('Failed to save')).toBeInTheDocument();
    });
  });
});
