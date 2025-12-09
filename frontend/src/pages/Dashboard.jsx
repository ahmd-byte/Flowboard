import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import { boardApi } from '../api/services';
import { Plus, Loader, X } from 'lucide-react';

const BACKGROUNDS = [
  'bg-gradient-to-br from-purple-500 to-indigo-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-amber-600',
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-red-500 to-pink-600',
];

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data } = await boardApi.getAll();
      setBoards(data);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    
    setCreating(true);
    try {
      const { data } = await boardApi.create({
        title: newBoardTitle,
        background: selectedBg
      });
      setBoards([...boards, data]);
      setShowModal(false);
      setNewBoardTitle('');
      toast.success('Board created!');
    } catch (err) {
      console.error('Failed to create board:', err);
      toast.error('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8 ml-64">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Boards</h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map(board => (
                <Link to={`/board/${board.id}`} key={board.id} className="block group">
                  <div className={`h-32 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 ${board.background} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <h3 className="text-white font-bold text-lg relative z-10">{board.title}</h3>
                  </div>
                </Link>
              ))}
              
              <button 
                onClick={() => setShowModal(true)}
                className="h-32 bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 group"
              >
                <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md mb-2 transition-shadow">
                  <Plus size={20} />
                </div>
                <span className="font-medium text-sm">Create new board</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Board</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Board Title</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter board title..."
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div className="grid grid-cols-6 gap-2">
                  {BACKGROUNDS.map((bg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`h-10 rounded-lg ${bg} ${selectedBg === bg ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={creating || !newBoardTitle.trim()}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader className="animate-spin" size={18} /> : null}
                Create Board
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
