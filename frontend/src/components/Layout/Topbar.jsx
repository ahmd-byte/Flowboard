import useUserStore from '../../store/userStore';
import { LogOut, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b ml-64">
      <div className="font-semibold text-gray-700">
        Dashboard
      </div>
      <div className="flex items-center space-x-6">
         <button className="text-gray-400 hover:text-gray-600">
            <Bell size={20} />
         </button>
         <div className="flex items-center space-x-3 pl-6 border-l">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email || ''}</div>
            </div>
            <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                {user?.name?.[0].toUpperCase() || <User size={18} />}
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 ml-2" title="Logout">
                <LogOut size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};
export default Topbar;

