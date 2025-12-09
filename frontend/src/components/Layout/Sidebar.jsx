import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold flex items-center space-x-2">
         <span>Flowboard</span>
      </div>
      <div className="flex-1 px-4 space-y-2">
        <Link to="/" className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-gray-800 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
           <LayoutDashboard size={20} />
           <span>Boards</span>
        </Link>
        {/* Future: Settings or other links */}
      </div>
      <div className="p-4 border-t border-gray-800">
         <button className="flex items-center space-x-2 p-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg w-full text-left transition-colors">
            <Settings size={20} />
            <span>Settings</span>
         </button>
      </div>
    </div>
  );
};
export default Sidebar;

