import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import useUserStore from '../store/userStore';
import api from '../api/axios';
import { User, Mail, Calendar, Save, Loader, Camera, Shield, Activity } from 'lucide-react';

const Profile = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ boards: 0, cards: 0 });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name);
    setEmail(user.email);
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/boards/');
      setStats({ boards: data.length, cards: 0 });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { name });
      setUser({ ...user, name: data.name });
      toast.success('Profile updated!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8 lg:ml-64 animate-fade-in pt-20 lg:pt-8">
          <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg shadow-red-600/30">
                      {getInitials(user?.name)}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-neutral-800 rounded-xl p-2 shadow-lg hover:bg-neutral-700 border border-neutral-700 transition-colors">
                      <Camera size={16} className="text-neutral-400" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-white">{user?.name}</h2>
                  <p className="text-neutral-500 text-sm">{user?.email}</p>
                  
                  <div className="mt-6 pt-6 border-t border-neutral-800">
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                      <Calendar size={14} />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">{stats.boards}</div>
                    <div className="text-xs text-red-500/70">Boards</div>
                  </div>
                  <div className="bg-neutral-800 rounded-xl p-4 text-center border border-neutral-700">
                    <div className="text-2xl font-bold text-white">{stats.cards}</div>
                    <div className="text-xs text-neutral-500">Cards</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <User size={20} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 w-full p-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="pl-12 w-full p-3.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-600">Email cannot be changed</p>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
                    >
                      {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <Shield size={20} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
                </div>
                <p className="text-neutral-500 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="bg-red-500/10 text-red-500 px-4 py-2.5 rounded-xl font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
