import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { LogOut, User, Bell, Settings, ChevronDown, Check, Clock } from 'lucide-react';

const Topbar = () => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/profile') return 'My Profile';
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname.startsWith('/board/')) return 'Board';
    return 'Dashboard';
  };

  // Mock notifications
  const notifications = [
    { id: 1, type: 'card', message: 'New card added to "To Do"', time: '2 min ago', read: false },
    { id: 2, type: 'invite', message: 'You were invited to Project X', time: '1 hour ago', read: false },
    { id: 3, type: 'move', message: 'Card moved to "Done"', time: '3 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b ml-64">
      <div className="font-semibold text-gray-700 text-lg">
        {getPageTitle()}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border py-2 z-50">
              <div className="px-4 py-2 border-b flex items-center justify-between">
                <span className="font-semibold text-gray-800">Notifications</span>
                <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                  Mark all read
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${!notif.read ? 'bg-purple-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-purple-500' : 'bg-transparent'}`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="px-4 py-2 border-t">
                <Link 
                  to="/settings"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  onClick={() => setShowNotifications(false)}
                >
                  Notification settings →
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 pl-4 border-l hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.email || ''}</div>
            </div>
            <div className="h-9 w-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.[0].toUpperCase() || <User size={18} />}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
              <div className="px-4 py-3 border-b">
                <div className="font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
              
              <div className="py-2">
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              </div>
              
              <div className="border-t py-2">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
