// Settings Service - Platform configuration persistence
import { safeJSONParse } from './safeJSON';

export interface PlatformSettings {
  general: {
    platformName: string;
    logoUrl: string;
    contactEmail: string;
    supportPhone: string;
    defaultCurrency: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    senderName: string;
    senderEmail: string;
    enableSsl: boolean;
  };
  security: {
    require2FA: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
    enableAuditLog: boolean;
  };
  api: {
    publicKey: string;
    privateKey: string;
    webhookUrl: string;
    rateLimitPerMinute: number;
  };
}

const DEFAULT_SETTINGS: PlatformSettings = {
  general: {
    platformName: 'Levav Talent Afrika',
    logoUrl: '',
    contactEmail: 'support@levav.afrika',
    supportPhone: '+260 97X XXX XXX',
    defaultCurrency: 'ZMW',
    defaultLanguage: 'en',
    maintenanceMode: false,
  },
  email: {
    smtpHost: 'smtp.levav.afrika',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    senderName: 'Levav Talent',
    senderEmail: 'noreply@levav.afrika',
    enableSsl: true,
  },
  security: {
    require2FA: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableAuditLog: true,
  },
  api: {
    publicKey: 'pk_live_' + Math.random().toString(36).substring(2, 15),
    privateKey: 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    webhookUrl: '',
    rateLimitPerMinute: 100,
  },
};

const SETTINGS_KEY = 'levav_platform_settings';

export function getSettings(): PlatformSettings {
  return safeJSONParse(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: PlatformSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
}

export function updateSetting(
  section: keyof PlatformSettings,
  key: string,
  value: string | boolean | number
): void {
  const settings = getSettings();
  (settings[section] as Record<string, unknown>)[key] = value;
  saveSettings(settings);
}
