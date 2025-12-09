import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import EmptyState from '../components/UI/EmptyState';
import { BoardSkeleton, StatsSkeleton } from '../components/UI/Skeletons';
import { boardApi, statsApi } from '../api/services';
import { Plus, X, LayoutDashboard, CheckSquare, Users, TrendingUp, Sparkles, Trash2, MoreVertical } from 'lucide-react';

const BACKGROUNDS = [
  'bg-gradient-to-br from-red-600 to-red-900',
  'bg-gradient-to-br from-neutral-800 to-neutral-900',
  'bg-gradient-to-br from-red-700 to-black',
  'bg-gradient-to-br from-zinc-700 to-zinc-900',
  'bg-gradient-to-br from-red-800 to-neutral-900',
  'bg-gradient-to-br from-stone-700 to-stone-900',
];

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    total_boards: 0,
    total_cards: 0,
    completed_cards: 0,
    total_members: 0,
    cards_this_week: 0,
    completion_rate: 0
  });

  useEffect(() => {
    fetchBoards();
    fetchStats();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  const fetchStats = async () => {
    try {
      const { data } = await statsApi.getDashboard();
      setDashboardStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
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
      fetchStats();
    } catch (err) {
      console.error('Failed to create board:', err);
      toast.error('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId, boardTitle) => {
    if (!confirm(`Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(boardId);
    try {
      await boardApi.delete(boardId);
      setBoards(boards.filter(b => b.id !== boardId));
      toast.success('Board deleted!');
      fetchStats();
    } catch (err) {
      console.error('Failed to delete board:', err);
      toast.error('Failed to delete board');
    } finally {
      setDeletingId(null);
      setMenuOpenId(null);
    }
  };

  // Stats data from API
  const stats = [
    { 
      label: 'Total Boards', 
      value: dashboardStats.total_boards, 
      icon: LayoutDashboard, 
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      change: `${boards.length} active`
    },
    { 
      label: 'Total Tasks', 
      value: dashboardStats.total_cards, 
      icon: CheckSquare, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      change: `${dashboardStats.completed_cards} completed`
    },
    { 
      label: 'Team Members', 
      value: dashboardStats.total_members, 
      icon: Users, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      change: 'collaborators'
    },
    { 
      label: 'Completion Rate', 
      value: `${dashboardStats.completion_rate}%`, 
      icon: TrendingUp, 
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      change: `+${dashboardStats.cards_this_week} this week`
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8 ml-64 animate-fade-in">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-red-500" />
              <span className="text-red-500 font-medium text-sm">Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back! 👋</h1>
            <p className="text-neutral-500">Here's what's happening with your projects today.</p>
          </div>
          
          {/* Stats Grid */}
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
              {stats.map((stat, i) => (
                <div 
                  key={i}
                  className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 animate-slide-up group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <span className="text-[10px] text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Boards Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Boards</h2>
              <p className="text-sm text-neutral-500">Manage and organize your projects</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
            >
              <Plus size={18} />
              New Board
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
              {[...Array(4)].map((_, i) => <BoardSkeleton key={i} />)}
            </div>
          ) : boards.length === 0 ? (
            <EmptyState
              type="boards"
              title="No boards yet"
              description="Create your first board to start organizing your projects and tasks."
              actionLabel="Create Board"
              onAction={() => setShowModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
              {boards.map((board, i) => (
                <div 
                  key={board.id} 
                  className="relative group animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <Link to={`/board/${board.id}`}>
                    <div className={`h-36 rounded-2xl p-5 shadow-lg transition-all duration-300 ${board.background || BACKGROUNDS[0]} relative overflow-hidden card-hover border border-white/10`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-red-300 transition-colors">
                          {board.title}
                        </h3>
                        <p className="text-white/60 text-xs">Click to open board</p>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Menu Button */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === board.id ? null : board.id);
                      }}
                      className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {menuOpenId === board.id && (
                      <div 
                        className="absolute right-0 mt-1 w-40 bg-neutral-900 rounded-xl border border-neutral-700 shadow-xl overflow-hidden z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDeleteBoard(board.id, board.title)}
                          disabled={deletingId === board.id}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          {deletingId === board.id ? (
                            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Delete Board
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Board Card */}
              <button 
                onClick={() => setShowModal(true)}
                className="h-36 bg-neutral-900 rounded-2xl p-5 border-2 border-dashed border-neutral-700 hover:border-red-500/50 hover:bg-neutral-800/50 transition-all duration-300 flex flex-col items-center justify-center text-neutral-500 hover:text-red-500 group"
              >
                <div className="p-3 bg-neutral-800 rounded-xl group-hover:bg-red-500/20 mb-2 transition-all duration-300">
                  <Plus size={24} />
                </div>
                <span className="font-medium text-sm">Create new board</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-neutral-800 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Board</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBoard}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-400 mb-2">Board Title</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full p-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter board title..."
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-400 mb-3">Background</label>
                <div className="grid grid-cols-6 gap-2">
                  {BACKGROUNDS.map((bg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`h-10 rounded-xl ${bg} transition-all duration-200 ${
                        selectedBg === bg 
                          ? 'ring-2 ring-offset-2 ring-offset-neutral-900 ring-red-500 scale-110' 
                          : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={creating || !newBoardTitle.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 hover:shadow-red-600/50"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={18} />
                    Create Board
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
