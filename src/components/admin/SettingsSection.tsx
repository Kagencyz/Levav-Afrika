import { motion } from "framer-motion";
import {
  Settings,
  Mail,
  Shield,
  Key,
  Save,
  Globe,
  Image,
  AtSign,
  Lock,
  Clock,
  ToggleLeft,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { getSettings, saveSettings, resetSettings, type PlatformSettings } from "@/lib/settingsService";
import { StableInput, StableTextarea, StableSelect } from "@/components/StableInputs";
import { toast } from "sonner";

interface SectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}

function SectionCard({ icon: Icon, title, description, children, delay = 0 }: SectionProps) {
  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#C6FF34]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-[#666666]">{description}</p>
        </div>
      </div>
      <div className="space-y-4 pt-2">{children}</div>
    </motion.div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-[#A0A0A0] mb-1.5">{children}</label>;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-[#C6FF34]" : "bg-white/[0.08]"}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          on ? "translate-x-5.5 left-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsSection() {
  const [settings, setSettings] = useState<PlatformSettings>(getSettings);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Local toggles for UI-only settings not in PlatformSettings
  const [forcePasswordReset, setForcePasswordReset] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(true);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleKey = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  // Update a nested setting field
  const updateField = useCallback(<S extends keyof PlatformSettings, K extends keyof PlatformSettings[S]>(
    section: S,
    key: K,
    value: PlatformSettings[S][K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [section]: { ...prev[section], [key]: value } } as PlatformSettings;
      // Auto-save with debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveSettings(next);
      }, 500);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    setSaved(true);
    toast.success("Settings saved successfully");
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all settings to defaults? This cannot be undone.")) {
      resetSettings();
      toast.info("Settings reset. Reloading...");
      setTimeout(() => window.location.reload(), 600);
    }
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Refresh settings from localStorage on mount (in case another tab changed them)
  useEffect(() => {
    const stored = getSettings();
    setSettings(stored);
  }, []);

  const apiKeys = [
    { name: "Public API Key", value: settings.api.publicKey, env: "LEVAV_PUBLIC_KEY" },
    { name: "Secret API Key", value: settings.api.privateKey, env: "LEVAV_SECRET_KEY" },
    { name: "Webhook URL", value: settings.api.webhookUrl || "whsec_9Kj7Lh4Mn3Pq2Rs5Tv8Ux6Wy1Zc", env: "LEVAV_WEBHOOK_SECRET" },
  ];

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Settings
      </motion.h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <SectionCard icon={Settings} title="General Settings" description="Platform identity and contact info" delay={0.05}>
          <div>
            <FormLabel>Platform Name</FormLabel>
            <StableInput
              type="text"
              value={settings.general.platformName}
              onValueChange={(v) => updateField("general", "platformName", v)}
              placeholder="Levav Talent Afrika"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
          <div>
            <FormLabel>Logo URL</FormLabel>
            <div className="flex gap-2">
              <StableInput
                type="text"
                value={settings.general.logoUrl}
                onValueChange={(v) => updateField("general", "logoUrl", v)}
                placeholder="https://cdn.levav.afrika/logo-v2.svg"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
              />
            </div>
          </div>
          <div>
            <FormLabel>Contact Email</FormLabel>
            <StableInput
              type="email"
              value={settings.general.contactEmail}
              onValueChange={(v) => updateField("general", "contactEmail", v)}
              placeholder="support@levav.afrika"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
          <div>
            <FormLabel>Support Phone</FormLabel>
            <StableInput
              type="text"
              value={settings.general.supportPhone}
              onValueChange={(v) => updateField("general", "supportPhone", v)}
              placeholder="+260 97X XXX XXX"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
        </SectionCard>

        {/* Email Settings */}
        <SectionCard icon={Mail} title="Email Settings" description="SMTP configuration for transactional emails" delay={0.1}>
          <div>
            <FormLabel>SMTP Host</FormLabel>
            <StableInput
              type="text"
              value={settings.email.smtpHost}
              onValueChange={(v) => updateField("email", "smtpHost", v)}
              placeholder="smtp.levav.afrika"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Port</FormLabel>
              <StableSelect
                value={settings.email.smtpPort}
                onValueChange={(v) => updateField("email", "smtpPort", v)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors appearance-none cursor-pointer"
              >
                <option value="25" className="bg-[#1A1A1A]">25</option>
                <option value="465" className="bg-[#1A1A1A]">465</option>
                <option value="587" className="bg-[#1A1A1A]">587</option>
                <option value="2525" className="bg-[#1A1A1A]">2525</option>
              </StableSelect>
            </div>
            <div>
              <FormLabel>Encryption</FormLabel>
              <StableSelect
                value={settings.email.enableSsl ? "TLS" : "None"}
                onValueChange={(v) => updateField("email", "enableSsl", v === "TLS" || v === "SSL")}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors appearance-none cursor-pointer"
              >
                <option value="None" className="bg-[#1A1A1A]">None</option>
                <option value="SSL" className="bg-[#1A1A1A]">SSL</option>
                <option value="TLS" className="bg-[#1A1A1A]">TLS</option>
              </StableSelect>
            </div>
          </div>
          <div>
            <FormLabel>SMTP Username</FormLabel>
            <StableInput
              type="text"
              value={settings.email.smtpUser}
              onValueChange={(v) => updateField("email", "smtpUser", v)}
              placeholder="apikey"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
          <div>
            <FormLabel>SMTP Password</FormLabel>
            <StableInput
              type="password"
              value={settings.email.smtpPassword}
              onValueChange={(v) => updateField("email", "smtpPassword", v)}
              placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
          <div>
            <FormLabel>Sender Name</FormLabel>
            <StableInput
              type="text"
              value={settings.email.senderName}
              onValueChange={(v) => updateField("email", "senderName", v)}
              placeholder="Levav Talent Afrika"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
          <div>
            <FormLabel>Sender Email</FormLabel>
            <StableInput
              type="email"
              value={settings.email.senderEmail}
              onValueChange={(v) => updateField("email", "senderEmail", v)}
              placeholder="noreply@levavtalent.afrika"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
            />
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard icon={Shield} title="Security" description="Authentication and session policies" delay={0.15}>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-white font-medium">Two-Factor Authentication</div>
              <div className="text-xs text-[#666666]">Require 2FA for all admin accounts</div>
            </div>
            <Toggle on={settings.security.require2FA} onChange={(v) => updateField("security", "require2FA", v)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-white font-medium">Force Password Reset (90 days)</div>
              <div className="text-xs text-[#666666]">Auto-expire passwords periodically</div>
            </div>
            <Toggle on={forcePasswordReset} onChange={setForcePasswordReset} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-white font-medium">Login Notifications</div>
              <div className="text-xs text-[#666666]">Email alert on new device login</div>
            </div>
            <Toggle on={loginNotifications} onChange={setLoginNotifications} />
          </div>
          <div className="pt-2">
            <FormLabel>Session Timeout</FormLabel>
            <StableSelect
              value={String(settings.security.sessionTimeout)}
              onValueChange={(v) => updateField("security", "sessionTimeout", parseInt(v, 10) || 60)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="15" className="bg-[#1A1A1A]">15 minutes</option>
              <option value="30" className="bg-[#1A1A1A]">30 minutes</option>
              <option value="60" className="bg-[#1A1A1A]">1 hour</option>
              <option value="120" className="bg-[#1A1A1A]">2 hours</option>
              <option value="240" className="bg-[#1A1A1A]">4 hours</option>
            </StableSelect>
          </div>
          <div className="pt-2">
            <FormLabel>Max Login Attempts</FormLabel>
            <StableSelect
              value={String(settings.security.maxLoginAttempts)}
              onValueChange={(v) => updateField("security", "maxLoginAttempts", parseInt(v, 10) || 5)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="3" className="bg-[#1A1A1A]">3</option>
              <option value="5" className="bg-[#1A1A1A]">5</option>
              <option value="10" className="bg-[#1A1A1A]">10</option>
              <option value="999" className="bg-[#1A1A1A]">Unlimited</option>
            </StableSelect>
          </div>
        </SectionCard>

        {/* API Keys */}
        <SectionCard icon={Key} title="API Keys" description="Manage your API credentials" delay={0.2}>
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.env} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#A0A0A0] font-medium">{key.name}</span>
                  <span className="text-[10px] text-[#666666] font-mono">{key.env}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 font-mono text-xs text-[#A0A0A0] truncate">
                    {showKeys[key.env] ? key.value : "•".repeat(32)}
                  </div>
                  <button
                    onClick={() => toggleKey(key.env)}
                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                    title={showKeys[key.env] ? "Hide" : "Show"}
                  >
                    {showKeys[key.env] ? (
                      <EyeOff className="w-4 h-4 text-[#A0A0A0]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#A0A0A0]" />
                    )}
                  </button>
                  <button
                    onClick={() => navigator.clipboard?.writeText(key.value)}
                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-[#A0A0A0]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const next = {
                ...settings,
                api: {
                  ...settings.api,
                  publicKey: 'pk_live_' + Math.random().toString(36).substring(2, 15),
                  privateKey: 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                },
              };
              setSettings(next);
              saveSettings(next);
              toast.success("API keys regenerated");
            }}
            className="w-full py-2.5 text-sm text-[#C6FF34] border border-[#C6FF34]/20 rounded-xl hover:bg-[#C6FF34]/5 transition-colors font-medium"
          >
            Regenerate All Keys
          </button>
        </SectionCard>
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] text-[#A0A0A0] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[#C6FF34] text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#b8f030] transition-colors"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save All Changes"}
        </motion.button>
      </motion.div>
    </div>
  );
}
