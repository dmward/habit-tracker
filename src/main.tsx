import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAuthStore, setDataStoreCallbacks } from './store/authStore';
import { useHabitStore } from './store/habitStore';
import { useJournalStore } from './store/journalStore';

// Register data store callbacks for auth state changes
setDataStoreCallbacks(
  // Initialize callback - called when user logs in
  async () => {
    await Promise.all([
      useHabitStore.getState().initialize(),
      useJournalStore.getState().initialize(),
    ]);
  },
  // Reset callback - called when user logs out
  () => {
    useHabitStore.getState().reset();
    useJournalStore.getState().reset();
  }
);

// Initialize auth before rendering
useAuthStore.getState().initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
