import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, User, HelpCircle, Zap } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        isActive(to) 
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Flowboard
          </span>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-2">
        <div className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">Main</div>
        <NavLink to="/" icon={LayoutDashboard} label="Boards" />
        <NavLink to="/profile" icon={User} label="Profile" />
      </div>
      
      {/* Bottom Section */}
      <div className="p-4 space-y-2 border-t border-gray-800">
        <NavLink to="/settings" icon={Settings} label="Settings" />
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
        >
          <HelpCircle size={20} />
          <span className="font-medium">Help & Support</span>
        </a>
      </div>
      
      {/* Version */}
      <div className="px-6 py-4 text-xs text-gray-600">
        Flowboard v1.0.0
      </div>
    </div>
  );
};

export default Sidebar;
