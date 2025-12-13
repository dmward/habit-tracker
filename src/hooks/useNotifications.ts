import { useEffect, useState, useRef } from 'react';
import { useHabitStore } from '../store/habitStore';
import {
  requestNotificationPermission,
  scheduleNotification,
  cancelNotification,
} from '../utils/notifications';

export function useNotifications() {
  const habits = useHabitStore((state) => state.habits);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const scheduledNotifications = useRef<Map<string, number>>(new Map());

  // Check current permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Schedule notifications for all habits with reminders enabled
  useEffect(() => {
    if (permission !== 'granted') {
      return;
    }

    // Cancel all existing notifications
    scheduledNotifications.current.forEach((timeoutId) => {
      cancelNotification(timeoutId);
    });
    scheduledNotifications.current.clear();

    // Schedule new notifications
    habits.forEach((habit) => {
      if (habit.reminderEnabled && habit.reminderTime && !habit.archived) {
        const timeoutId = scheduleNotification(habit, (id) => {
          scheduledNotifications.current.set(habit.id, id);
        });
        if (timeoutId) {
          scheduledNotifications.current.set(habit.id, timeoutId);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      scheduledNotifications.current.forEach((timeoutId) => {
        cancelNotification(timeoutId);
      });
      scheduledNotifications.current.clear();
    };
  }, [habits, permission]);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  };

  return {
    permission,
    requestPermission,
    isSupported: 'Notification' in window,
  };
}
