import { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import { Bell, Moon, Sun, Globe, Lock, Mail, Save, Loader, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [cardCreated, setCardCreated] = useState(true);
  const [cardMoved, setCardMoved] = useState(true);
  const [memberInvited, setMemberInvited] = useState(true);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSaveNotifications = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Notification settings saved!');
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
    // Simulate API call
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
        <div className="font-medium text-gray-800">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8 ml-64">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
          
          <div className="max-w-3xl space-y-6">
            {/* Appearance */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {darkMode ? <Moon size={20} className="text-purple-600" /> : <Sun size={20} className="text-purple-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Appearance</h3>
              </div>
              
              <ToggleSwitch
                enabled={darkMode}
                onChange={setDarkMode}
                label="Dark Mode"
                description="Use dark theme across the application"
              />
              
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
                    <option value="en">English</option>
                    <option value="ms">Bahasa Malaysia</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              
              <ToggleSwitch
                enabled={emailNotifications}
                onChange={setEmailNotifications}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              
              {emailNotifications && (
                <div className="pl-4 border-l-2 border-purple-200 ml-2 space-y-0">
                  <ToggleSwitch
                    enabled={cardCreated}
                    onChange={setCardCreated}
                    label="Card Created"
                    description="When a new card is added to your boards"
                  />
                  <ToggleSwitch
                    enabled={cardMoved}
                    onChange={setCardMoved}
                    label="Card Moved"
                    description="When a card is moved between lists"
                  />
                  <ToggleSwitch
                    enabled={memberInvited}
                    onChange={setMemberInvited}
                    label="Board Invitations"
                    description="When you're invited to a board"
                  />
                </div>
              )}
              
              <div className="pt-4 mt-4 border-t">
                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Preferences
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Lock size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Security</h3>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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

