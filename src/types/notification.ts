export interface NotificationState {
  permission: NotificationPermission;
  scheduledNotifications: Map<string, number>; // habitId -> timeoutId
}
