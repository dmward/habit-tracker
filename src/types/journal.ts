export interface JournalEntry {
  date: string;        // YYYY-MM-DD (primary key - one entry per day)
  content: string;     // The journal text content
  createdAt: string;   // ISO datetime
  updatedAt: string;   // ISO datetime
}
