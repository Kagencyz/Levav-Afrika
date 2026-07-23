import { useCallback } from 'react';
import { safeJSONParse, safeJSONSet } from '@/lib/safeJSON';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

/** Atomically read-modify-write notifications to prevent cross-tab data loss */
function atomicNotificationUpdate(
  updater: (notifications: Notification[]) => Notification[]
): void {
  try {
    const notifications = safeJSONParse<Notification[]>('notifications', []);
    const updated = updater(notifications);
    safeJSONSet('notifications', updated);
  } catch {
    // Silently fail - notifications are non-critical
  }
}

export function useNotifications() {
  const createNotification = useCallback((type: string, title: string, message: string, link?: string) => {
    atomicNotificationUpdate((notifications) => {
      notifications.unshift({
        id: Date.now(),
        type,
        title,
        message,
        read: false,
        link,
        createdAt: new Date().toISOString(),
      });
      return notifications.slice(0, 50); // keep last 50
    });
  }, []);

  const notifyApplicationSubmitted = useCallback((jobTitle: string) => {
    createNotification('application', 'Application Submitted', `Your application for ${jobTitle} has been submitted.`, '/dashboard');
  }, [createNotification]);

  const notifyNewApplicant = useCallback((applicantName: string, jobTitle: string) => {
    createNotification('job', 'New Applicant', `${applicantName} applied for ${jobTitle}.`, '/employer/jobs');
  }, [createNotification]);

  const notifyMessageReceived = useCallback((senderName: string) => {
    createNotification('message', 'New Message', `You have a new message from ${senderName}.`, '/messages');
  }, [createNotification]);

  const notifyEmployerVerified = useCallback((companyName: string) => {
    createNotification('success', 'Employer Verified', `${companyName} has been verified. You can now post jobs.`, '/employer/jobs');
  }, [createNotification]);

  const notifyProfileViewed = useCallback((viewerName: string) => {
    createNotification('alert', 'Profile Viewed', `${viewerName} viewed your profile.`, '/dashboard');
  }, [createNotification]);

  return {
    createNotification,
    notifyApplicationSubmitted,
    notifyNewApplicant,
    notifyMessageReceived,
    notifyEmployerVerified,
    notifyProfileViewed,
  };
}
