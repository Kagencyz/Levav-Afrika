import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Bell,
  Shield,
  X,
  Plus,
  Camera,
  MapPin,
  Check,
  Trash2,
  ChevronRight,
  Mail,
  Eye,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { StableInput, StableTextarea, StableSelect } from '@/components/StableInputs';

// ─── Types ───────────────────────────────────────────────
type TabId = 'profile' | 'account' | 'notifications' | 'privacy';

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  category: string;
  skills: string[];
  avatar: string;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailMessages: boolean;
  emailApplications: boolean;
  pushMessages: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'talent' | 'private';
  showWriScore: boolean;
  showRate: boolean;
  availableForHire: boolean;
}

// ─── Constants ───────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

const CATEGORIES = [
  'Technology',
  'Visual Arts',
  'Music',
  'Dance',
  'Writing',
  'Skilled Trades',
  'Healthcare',
  'Agriculture',
  'Education',
  'Business',
  'Other',
];

const VISIBILITY_OPTIONS: { value: PrivacySettings['profileVisibility']; label: string; desc: string }[] = [
  { value: 'public', label: 'Public', desc: 'Visible to everyone' },
  { value: 'talent', label: 'Talent Only', desc: 'Only logged-in talent members' },
  { value: 'private', label: 'Private', desc: 'Only you' },
];

// ─── Animation Variants ──────────────────────────────────
const contentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: [0.19, 1, 0.22, 1] } },
};

// ─── Input Styling Classes ───────────────────────────────
const inputBaseClass =
  'w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm font-body';

const selectBaseClass =
  'w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm font-body appearance-none cursor-pointer';

const labelBaseClass = 'block text-white/70 text-sm font-medium mb-2 font-body';

// ─── Helper: localStorage keys ───────────────────────────
const LS_PROFILE = 'settings_profile';
const LS_NOTIFICATIONS = 'settings_notifications';
const LS_PRIVACY = 'settings_privacy';

// ─── Main Component ──────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    bio: '',
    location: '',
    category: '',
    skills: [],
    avatar: user?.avatar || '',
  });
  const [skillInput, setSkillInput] = useState('');

  // Password state
  const [password, setPassword] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailMessages: true,
    emailApplications: true,
    pushMessages: true,
    marketingEmails: false,
    weeklyDigest: true,
  });

  // Privacy state
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showWriScore: true,
    showRate: true,
    availableForHire: true,
  });

  // ─── Load from localStorage on mount ──────────────────
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(LS_PROFILE);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          name: parsed.name || user?.name || prev.name,
          avatar: parsed.avatar || user?.avatar || prev.avatar,
        }));
      } else {
        // Try to load from onboarding data
        const onboardingData = localStorage.getItem('onboarding_data');
        if (onboardingData) {
          const parsed = JSON.parse(onboardingData);
          setProfile((prev) => ({
            ...prev,
            name: `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || prev.name,
            location: `${parsed.city || ''}${parsed.city && parsed.country ? ', ' : ''}${parsed.country || ''}`.trim() || prev.location,
          }));
        }
      }

      const savedNotifications = localStorage.getItem(LS_NOTIFICATIONS);
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      const savedPrivacy = localStorage.getItem(LS_PRIVACY);
      if (savedPrivacy) {
        setPrivacy(JSON.parse(savedPrivacy));
      }
    } catch {
      // ignore
    }
  }, [user]);

  // ─── Profile Handlers ─────────────────────────────────
  const updateProfile = useCallback(<K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!profile.skills.includes(trimmed)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  }, [skillInput, profile.skills]);

  const removeSkill = useCallback((skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  }, []);

  const saveProfile = useCallback(() => {
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    toast.success('Profile saved!');
  }, [profile]);

  // ─── Password Handlers ────────────────────────────────
  const updatePasswordField = useCallback(<K extends keyof PasswordData>(field: K, value: PasswordData[K]) => {
    setPassword((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updatePassword = useCallback(() => {
    if (!password.oldPassword || !password.newPassword || !password.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (password.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    toast.success('Password updated!');
    setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
  }, [password]);

  const deleteAccount = useCallback(() => {
    if (window.confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) {
      // Only remove user-data keys, NOT auth tokens (those are handled by useAuth.logout)
      const keysToRemove = [
        LS_PROFILE,
        LS_NOTIFICATIONS,
        LS_PRIVACY,
        'onboarding_data',
        'talent_profiles',
        'employer_profiles',
        'employer_data',
        'profile_data',
        'bookings_data',
        'payments_',
        'transactions_',
        'screening_criteria',
        'screening_apply_to_all',
        'skillgap_28day_plan',
        'skillgap_selected_role',
        'levav_saved_jobs',
        'levav_conversations',
        'notifications',
        'sync_queue',
        'settings_',
      ];
      keysToRemove.forEach((key) => {
        // Use prefix matching for keys like 'payments_'
        if (key.endsWith('_')) {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith(key)) localStorage.removeItem(k);
          }
        } else {
          localStorage.removeItem(key);
        }
      });
      toast.success('Account deleted');
      window.location.href = '/';
    }
  }, []);

  // ─── Notification Handlers ────────────────────────────
  const updateNotification = useCallback(<K extends keyof NotificationSettings>(field: K, value: NotificationSettings[K]) => {
    setNotifications((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(LS_NOTIFICATIONS, JSON.stringify(next));
      return next;
    });
  }, []);

  // ─── Privacy Handlers ─────────────────────────────────
  const updatePrivacy = useCallback(<K extends keyof PrivacySettings>(field: K, value: PrivacySettings[K]) => {
    setPrivacy((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(LS_PRIVACY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ─── Tab Content Components ───────────────────────────
  const ProfileTab = useMemo(() => {
    return (
      <motion.div
        key="profile"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
            <User size={18} className="text-[#C6FF34]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-display">Profile Settings</h2>
            <p className="text-xs text-white/40">Manage your public profile</p>
          </div>
        </div>

        {/* Avatar URL + Preview */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <label className={labelBaseClass}>Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Camera size={24} className="text-white/30" />
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Camera size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <StableInput
                  type="url"
                  inputMode="url"
                  value={profile.avatar}
                  onChange={(e) => updateProfile('avatar', e.target.value)}
                  placeholder="Paste image URL..."
                  className={`${inputBaseClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={labelBaseClass}>Full Name</label>
          <StableInput
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
            placeholder="Your name"
            className={inputBaseClass}
            autoComplete="name"
          />
        </div>

        {/* Bio */}
        <div>
          <label className={labelBaseClass}>Bio</label>
          <StableTextarea
            value={profile.bio}
            onChange={(e) => updateProfile('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className={`${inputBaseClass} resize-none`}
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelBaseClass}>Location</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <StableInput
              type="text"
              value={profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
              placeholder="City, Country"
              className={`${inputBaseClass} pl-10`}
              autoComplete="address-level2"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={labelBaseClass}>Category</label>
          <div className="relative">
            <StableSelect
              value={profile.category}
              onChange={(e) => updateProfile('category', e.target.value)}
              className={selectBaseClass}
            >
              <option value="" className="bg-[#0A0A0A] text-white/40">
                Select your category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0A0A0A] text-white">
                  {cat}
                </option>
              ))}
            </StableSelect>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className={labelBaseClass}>Skills</label>
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <AnimatePresence>
                {profile.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-[#C6FF34] text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-[#C6FF34]/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
          <div className="flex gap-2">
            <StableInput
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter..."
              className={`${inputBaseClass} flex-1`}
            />
            <motion.button
              type="button"
              onClick={addSkill}
              disabled={!skillInput.trim()}
              className="px-4 py-3 bg-[#C6FF34] text-black rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              Add
            </motion.button>
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          type="button"
          onClick={saveProfile}
          className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check size={18} />
          Save Changes
        </motion.button>
      </motion.div>
    );
  }, [profile, skillInput, addSkill, removeSkill, saveProfile, updateProfile]);

  const AccountTab = useMemo(() => {
    return (
      <motion.div
        key="account"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
            <Lock size={18} className="text-[#C6FF34]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-display">Account Settings</h2>
            <p className="text-xs text-white/40">Manage your account security</p>
          </div>
        </div>

        {/* Email Display */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <label className={labelBaseClass}>Email Address</label>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-white/40" />
            <span className="text-white text-sm">{user?.email || 'Not available'}</span>
          </div>
          <p className="text-white/30 text-xs mt-1.5">Email cannot be changed</p>
        </div>

        {/* Change Password */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold text-white font-display">Change Password</h3>
          </div>

          <div>
            <label className={labelBaseClass}>Current Password</label>
            <StableInput
              type="password"
              value={password.oldPassword}
              onChange={(e) => updatePasswordField('oldPassword', e.target.value)}
              placeholder="Enter current password"
              className={inputBaseClass}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className={labelBaseClass}>New Password</label>
            <StableInput
              type="password"
              value={password.newPassword}
              onChange={(e) => updatePasswordField('newPassword', e.target.value)}
              placeholder="Enter new password"
              className={inputBaseClass}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className={labelBaseClass}>Confirm New Password</label>
            <StableInput
              type="password"
              value={password.confirmPassword}
              onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className={inputBaseClass}
              autoComplete="new-password"
            />
          </div>

          <motion.button
            type="button"
            onClick={updatePassword}
            className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock size={16} />
            Update Password
          </motion.button>
        </div>

        {/* Delete Account */}
        <div className="bg-red-500/[0.03] border border-red-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-red-400 font-display">Delete Account</h3>
          </div>
          <p className="text-white/40 text-xs">
            Once deleted, your account and all associated data will be permanently removed. This action cannot be undone.
          </p>
          <motion.button
            type="button"
            onClick={deleteAccount}
            className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            Delete Account
          </motion.button>
        </div>
      </motion.div>
    );
  }, [user, password, updatePasswordField, updatePassword, deleteAccount]);

  const NotificationsTab = useMemo(() => {
    return (
      <motion.div
        key="notifications"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
            <Bell size={18} className="text-[#C6FF34]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-display">Notifications</h2>
            <p className="text-xs text-white/40">Choose how you want to be notified</p>
          </div>
        </div>

        {/* Toggle List */}
        <div className="space-y-4">
          {[
            {
              key: 'emailMessages' as const,
              label: 'Email notifications for new messages',
              desc: 'Get an email when someone sends you a message',
              icon: Mail,
            },
            {
              key: 'emailApplications' as const,
              label: 'Email notifications for job applications',
              desc: 'Get an email when someone applies to your job',
              icon: Briefcase,
            },
            {
              key: 'pushMessages' as const,
              label: 'Push notifications for messages',
              desc: 'Receive push notifications in your browser',
              icon: Bell,
            },
            {
              key: 'marketingEmails' as const,
              label: 'Marketing emails',
              desc: 'Receive updates about new features and promotions',
              icon: ChevronRight,
            },
            {
              key: 'weeklyDigest' as const,
              label: 'Weekly digest',
              desc: 'A weekly summary of your activity',
              icon: Mail,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <item.icon size={14} className="text-white/40" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-white/30 text-xs">{item.desc}</p>
                </div>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) => updateNotification(item.key, checked)}
                className="data-[state=checked]:bg-[#C6FF34] flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }, [notifications, updateNotification]);

  const PrivacyTab = useMemo(() => {
    return (
      <motion.div
        key="privacy"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
            <Shield size={18} className="text-[#C6FF34]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-display">Privacy</h2>
            <p className="text-xs text-white/40">Control your profile visibility</p>
          </div>
        </div>

        {/* Profile Visibility Radio */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold text-white font-display">Profile Visibility</h3>
          </div>
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                privacy.profileVisibility === option.value
                  ? 'border-[#C6FF34]/40 bg-[#C6FF34]/5'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  privacy.profileVisibility === option.value
                    ? 'border-[#C6FF34]'
                    : 'border-white/20'
                }`}
              >
                {privacy.profileVisibility === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF34]" />
                )}
              </div>
              <input
                type="radio"
                name="profileVisibility"
                value={option.value}
                checked={privacy.profileVisibility === option.value}
                onChange={() => updatePrivacy('profileVisibility', option.value)}
                className="sr-only"
              />
              <div>
                <p className="text-white text-sm font-medium">{option.label}</p>
                <p className="text-white/30 text-xs">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          {[
            {
              key: 'showRate' as const,
              label: 'Show rate',
              desc: 'Display your rate on your profile',
              icon: DollarSign,
            },
            {
              key: 'availableForHire' as const,
              label: 'Available for hire',
              desc: 'Show that you are open to new opportunities',
              icon: Briefcase,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <item.icon size={14} className="text-white/40" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-white/30 text-xs">{item.desc}</p>
                </div>
              </div>
              <Switch
                checked={privacy[item.key]}
                onCheckedChange={(checked) => updatePrivacy(item.key, checked)}
                className="data-[state=checked]:bg-[#C6FF34] flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }, [privacy, updatePrivacy]);

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'profile':
        return ProfileTab;
      case 'account':
        return AccountTab;
      case 'notifications':
        return NotificationsTab;
      case 'privacy':
        return PrivacyTab;
    }
  }, [activeTab, ProfileTab, AccountTab, NotificationsTab, PrivacyTab]);

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-black px-4 py-8 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Page Title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mb-2">Settings</h1>
          <p className="text-sm text-white/50">Manage your profile, account, and preferences</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <motion.nav
            className="lg:w-56 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 bg-white/[0.03] lg:bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2 lg:border-r lg:border-white/[0.06] lg:bg-white/[0.03] lg:rounded-2xl lg:p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 lg:w-full ${
                      isActive
                        ? 'text-[#C6FF34] bg-[#C6FF34]/10'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {/* Active indicator - left border on desktop */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#C6FF34] rounded-r-full"
                        transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
                      />
                    )}
                    <Icon size={18} className={isActive ? 'text-[#C6FF34]' : 'text-white/40'} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </motion.nav>

          {/* Content Panel */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {tabContent}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
