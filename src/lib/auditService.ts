// Audit Service - Event logging for all platform activities
import { safeJSONParse } from './safeJSON';

export type AuditAction =
  | 'login' | 'logout' | 'register' | 'profile_update'
  | 'job_create' | 'job_apply' | 'job_status_change'
  | 'gig_apply' | 'gig_complete' | 'gig_review'
  | 'lesson_complete' | 'course_complete' | 'course_enroll'
  | 'levav28_task_complete' | 'levav28_day_complete' | 'levav28_graduate'
  | 'impact_volunteer' | 'impact_complete'
  | 'employer_register' | 'employer_verify' | 'employer_reject'
  | 'champion_apply' | 'champion_approve' | 'champion_reject'
  | 'settings_change' | 'role_change' | 'permission_change'
  | 'user_suspend' | 'user_activate'
  | 'payment_process' | 'subscription_change';

export type AuditStatus = 'success' | 'warning' | 'critical' | 'info';

export interface AuditEntry {
  id: string; // `audit_${Date.now()}_${random}`
  timestamp: string; // ISO string
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string; // what was affected (e.g., "Job #123", "User Profile")
  resourceId?: string;
  details?: string;
  ipAddress: string;
  status: AuditStatus;
  metadata?: Record<string, unknown>;
}

const AUDIT_KEY = 'levav_audit_log';
const MAX_ENTRIES = 500; // Keep last 500 entries

export function logEvent(
  userId: string,
  userEmail: string,
  action: AuditAction,
  resource: string,
  status: AuditStatus = 'success',
  details?: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): AuditEntry {
  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    details,
    ipAddress: 'client-side', // Would be server IP in production
    status,
    metadata,
  };

  const existing = getAuditLog();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));

  return entry;
}

export function getAuditLog(): AuditEntry[] {
  return safeJSONParse(AUDIT_KEY, []);
}

export function getAuditLogFiltered(filters: {
  userId?: string;
  action?: AuditAction;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}): AuditEntry[] {
  let entries = getAuditLog();

  if (filters.userId) entries = entries.filter(e => e.userId === filters.userId);
  if (filters.action) entries = entries.filter(e => e.action === filters.action);
  if (filters.status) entries = entries.filter(e => e.status === filters.status);
  if (filters.startDate) entries = entries.filter(e => e.timestamp >= filters.startDate!);
  if (filters.endDate) entries = entries.filter(e => e.timestamp <= filters.endDate!);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    entries = entries.filter(e =>
      e.userEmail.toLowerCase().includes(s) ||
      e.action.toLowerCase().includes(s) ||
      e.resource.toLowerCase().includes(s) ||
      (e.details?.toLowerCase().includes(s) ?? false)
    );
  }

  return entries;
}

export function getAuditStats(): {
  total: number;
  today: number;
  critical: number;
  warnings: number;
  uniqueUsers: number;
} {
  const entries = getAuditLog();
  const today = new Date().toISOString().split('T')[0];

  return {
    total: entries.length,
    today: entries.filter(e => e.timestamp.startsWith(today)).length,
    critical: entries.filter(e => e.status === 'critical').length,
    warnings: entries.filter(e => e.status === 'warning').length,
    uniqueUsers: new Set(entries.map(e => e.userId)).size,
  };
}

// Convenience: log with current user from localStorage
export function logWithCurrentUser(
  action: AuditAction,
  resource: string,
  status?: AuditStatus,
  details?: string,
  resourceId?: string
): AuditEntry | null {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return null;

    return logEvent(
      String(user.id || 'unknown'),
      user.email || 'unknown',
      action,
      resource,
      status || 'success',
      details,
      resourceId
    );
  } catch {
    return null;
  }
}
