import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, User, HelpCircle, Flame } from 'lucide-react';

const NavLink = ({ to, icon: Icon, label, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group ${
      isActive 
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
    }`}
  >
    <Icon size={20} className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
    <span className="font-medium">{label}</span>
    {isActive && (
      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
    )}
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-[#0a0a0a] text-white h-screen flex flex-col fixed left-0 top-0 border-r border-neutral-800">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-all duration-300">
            <Flame size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">
              Flowboard
            </span>
            <div className="text-[10px] text-red-500 font-medium tracking-wider">KANBAN POWER</div>
          </div>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-1 mt-4">
        <div className="text-[10px] uppercase text-neutral-600 font-bold px-3 mb-3 tracking-wider">Navigation</div>
        <NavLink to="/" icon={LayoutDashboard} label="Dashboard" isActive={isActive('/')} />
        <NavLink to="/profile" icon={User} label="Profile" isActive={isActive('/profile')} />
      </div>
      
      {/* Bottom Section */}
      <div className="p-4 space-y-1 border-t border-neutral-800">
        <NavLink to="/settings" icon={Settings} label="Settings" isActive={isActive('/settings')} />
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 text-neutral-500 hover:bg-neutral-800 hover:text-white rounded-xl transition-all duration-300"
        >
          <HelpCircle size={20} />
          <span className="font-medium">Help</span>
        </a>
      </div>
      
      {/* Version */}
      <div className="px-6 py-4 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">v1.0.0</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-neutral-500">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
