import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BoardView from '../components/Board/BoardView';
import useBoardStore from '../store/boardStore';
import useUserStore from '../store/userStore';
import { boardApi } from '../api/services';
import { Loader, ArrowLeft, Users, Settings, Home } from 'lucide-react';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const setBoardData = useBoardStore(state => state.setBoardData);
  const board = useBoardStore(state => state.board);
  const user = useUserStore(state => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchBoardData();
  }, [id]);

  const fetchBoardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await boardApi.getFull(id);
      setBoardData(data);
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('Failed to load board');
      toast.error('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  // Minimal top bar for board view
  const BoardTopbar = () => (
    <div className="h-14 bg-black/40 backdrop-blur-md text-white flex items-center justify-between px-4 border-b border-white/10 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="h-5 w-px bg-white/20" />
        <h1 className="font-bold text-lg truncate max-w-[300px]">
          {board?.title || 'Loading...'}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Dashboard"
        >
          <Home size={18} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
          <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm hidden sm:inline">{user?.name}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0a0a]">
        <div className="flex-1 flex flex-col">
          <BoardTopbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader className="animate-spin text-red-500 mx-auto mb-4" size={48} />
              <p className="text-neutral-400">Loading board...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#0a0a0a]">
        <div className="flex-1 flex flex-col">
          <BoardTopbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button 
                onClick={fetchBoardData}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <div className="flex-1 flex flex-col">
        <BoardTopbar />
        <div className="flex-1 overflow-hidden">
          <BoardView boardId={id} onRefresh={fetchBoardData} />
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
