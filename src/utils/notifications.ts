import type { Habit } from '../types/habit';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(habit: Habit): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification('Habit Reminder', {
    body: `Time to complete: ${habit.name}`,
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: habit.id,
    requireInteraction: false,
  });
}

export function calculateTimeUntilReminder(reminderTime: string): number {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const now = new Date();
  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (reminderDate <= now) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  return reminderDate.getTime() - now.getTime();
}

export function scheduleNotification(
  habit: Habit,
  onScheduled?: (timeoutId: number) => void
): number | null {
  if (!habit.reminderEnabled || !habit.reminderTime) {
    return null;
  }

  const timeUntil = calculateTimeUntilReminder(habit.reminderTime);

  // Don't schedule if it's more than 24 hours away (just to be safe)
  if (timeUntil > 24 * 60 * 60 * 1000) {
    return null;
  }

  const timeoutId = window.setTimeout(() => {
    showNotification(habit);
    // Reschedule for next day
    scheduleNotification(habit, onScheduled);
  }, timeUntil);

  if (onScheduled) {
    onScheduled(timeoutId);
  }

  return timeoutId;
}

export function cancelNotification(timeoutId: number): void {
  clearTimeout(timeoutId);
}
