import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import useThemeStore from '../../store/themeStore';
import SearchModal from '../UI/SearchModal';
import { LogOut, User, Bell, Settings, ChevronDown, Clock, Sun, Moon, Search, Command } from 'lucide-react';

const Topbar = () => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/profile') return 'My Profile';
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname.startsWith('/board/')) return 'Board';
    return 'Dashboard';
  };

  const notifications = [
    { id: 1, type: 'card', message: 'New card added to "To Do"', time: '2 min ago', read: false },
    { id: 2, type: 'invite', message: 'You were invited to Project X', time: '1 hour ago', read: false },
    { id: 3, type: 'move', message: 'Card moved to "Done"', time: '3 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="h-16 bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-white flex items-center justify-between px-4 lg:px-6 border-b border-neutral-800 dark:border-neutral-800 light:border-gray-200 lg:ml-64 fixed top-0 right-0 left-0 lg:left-64 z-30">
        <div className="flex items-center gap-3 ml-12 lg:ml-0">
          <h1 className="font-bold text-white dark:text-white light:text-gray-900 text-lg">{getPageTitle()}</h1>
          <div className="hidden sm:block h-6 w-px bg-neutral-800 dark:bg-neutral-800 light:bg-gray-200" />
          <span className="hidden sm:block text-xs text-neutral-500 dark:text-neutral-500 light:text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <button 
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-all duration-300 border border-neutral-700/50"
          >
            <Search size={16} />
            <span className="text-sm hidden sm:inline">Search</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-neutral-700 rounded border border-neutral-600 ml-2">
              <Command size={10} />K
            </kbd>
          </button>

          {/* Dark/Light Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all duration-300"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all duration-300"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-red-600/50">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#141414] rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                  <span className="font-bold text-white">Notifications</span>
                  <button className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors">
                    Mark all read
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-neutral-800/50 cursor-pointer border-b border-neutral-800/50 last:border-b-0 transition-colors ${!notif.read ? 'bg-red-500/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-red-500' : 'bg-neutral-700'}`} />
                        <div className="flex-1">
                          <p className="text-sm text-neutral-200">{notif.message}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                            <Clock size={10} />
                            <span>{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-900/50">
                  <Link 
                    to="/settings"
                    className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
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
              className="flex items-center space-x-3 pl-3 ml-2 border-l border-neutral-800 hover:bg-neutral-800/50 rounded-xl p-2 pr-3 transition-all duration-300"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">{user?.name || 'User'}</div>
                <div className="text-[10px] text-neutral-500">{user?.email || ''}</div>
              </div>
              <div className="h-9 w-9 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
                {user?.name?.[0].toUpperCase() || <User size={16} />}
              </div>
              <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#141414] rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                  <div className="font-semibold text-white">{user?.name}</div>
                  <div className="text-xs text-neutral-500">{user?.email}</div>
                </div>
                
                <div className="py-2">
                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                </div>
                
                <div className="border-t border-neutral-800 py-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 w-full text-left transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </>
  );
};

export default Topbar;
