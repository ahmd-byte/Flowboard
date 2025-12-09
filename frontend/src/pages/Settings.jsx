import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import { Bell, Moon, Sun, Globe, Lock, Save, Loader, Eye, EyeOff, Palette } from 'lucide-react';

// Settings storage key
const SETTINGS_KEY = 'flowboard-settings';

// Default settings
const defaultSettings = {
  darkMode: true,
  emailNotifications: true,
  cardCreated: true,
  cardMoved: true,
  memberInvited: true,
  language: 'en',
};

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

// Save settings to localStorage
const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
  }, []);

  // Update a setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    
    // Save to localStorage
    saveSettings(settings);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    toast.success('Settings saved!');
    setHasChanges(false);
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaving(false);
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <div className="font-medium text-white">{label}</div>
        {description && <div className="text-sm text-neutral-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-red-600' : 'bg-neutral-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8 ml-64 animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          
          <div className="max-w-3xl space-y-6">
            {/* Appearance */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Palette size={20} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Appearance</h3>
              </div>
              
              <ToggleSwitch
                enabled={settings.darkMode}
                onChange={(val) => updateSetting('darkMode', val)}
                label="Dark Mode"
                description="Use dark theme across the application"
              />
              
              <div className="pt-4 border-t border-neutral-800">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Language</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                  <select 
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="pl-12 w-full p-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ms">Bahasa Malaysia</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Bell size={20} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
              </div>
              
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={(val) => updateSetting('emailNotifications', val)}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              
              {settings.emailNotifications && (
                <div className="pl-4 border-l-2 border-red-500/30 ml-2 space-y-0">
                  <ToggleSwitch
                    enabled={settings.cardCreated}
                    onChange={(val) => updateSetting('cardCreated', val)}
                    label="Card Created"
                    description="When a new card is added to your boards"
                  />
                  <ToggleSwitch
                    enabled={settings.cardMoved}
                    onChange={(val) => updateSetting('cardMoved', val)}
                    label="Card Moved"
                    description="When a card is moved between lists"
                  />
                  <ToggleSwitch
                    enabled={settings.memberInvited}
                    onChange={(val) => updateSetting('memberInvited', val)}
                    label="Board Invitations"
                    description="When you're invited to a board"
                  />
                </div>
              )}
              
              <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center gap-3">
                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
                >
                  {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Preferences
                </button>
                {hasChanges && (
                  <span className="text-sm text-amber-500">• Unsaved changes</span>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Lock size={20} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Security</h3>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-12 pr-12 w-full p-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-4 top-3.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-12 w-full p-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 w-full p-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
                  >
                    {saving ? <Loader className="animate-spin" size={16} /> : <Lock size={16} />}
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
