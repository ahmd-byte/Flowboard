import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import useUserStore from '../store/userStore';
import api from '../api/axios';
import { User, Mail, Calendar, Save, Loader, Camera } from 'lucide-react';

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8 ml-64">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto">
                      {getInitials(user?.name)}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 border">
                      <Camera size={16} className="text-gray-600" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.boards}</div>
                    <div className="text-xs text-purple-600/70">Boards</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.cards}</div>
                    <div className="text-xs text-blue-600/70">Cards</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Edit Profile</h3>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="pl-10 w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200">
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

