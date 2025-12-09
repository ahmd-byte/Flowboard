import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    // Placeholder data
    setBoards([
        { id: 1, title: 'Project Alpha', background: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
        { id: 2, title: 'Marketing Campaign', background: 'bg-gradient-to-br from-pink-500 to-rose-600' },
        { id: 3, title: 'Development Roadmap', background: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    ]);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8 ml-64">
           <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Boards</h1>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map(board => (
                 <Link to={`/board/${board.id}`} key={board.id} className="block group">
                    <div className={`h-32 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 ${board.background} relative overflow-hidden`}>
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                       <h3 className="text-white font-bold text-lg relative z-10">{board.title}</h3>
                    </div>
                 </Link>
              ))}
              
              <button className="h-32 bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 group">
                 <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md mb-2 transition-shadow">
                    <Plus size={20} />
                 </div>
                 <span className="font-medium text-sm">Create new board</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;

