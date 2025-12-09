import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import BoardView from '../components/Board/BoardView';
import useBoardStore from '../store/boardStore';
import { boardApi } from '../api/services';
import { Loader } from 'lucide-react';

const BoardPage = () => {
  const { id } = useParams();
  const setBoardData = useBoardStore(state => state.setBoardData);
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 ml-64 flex items-center justify-center">
            <Loader className="animate-spin text-blue-500" size={48} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 ml-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button 
                onClick={fetchBoardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Topbar />
        <div className="flex-1 ml-64 overflow-hidden relative">
          <BoardView boardId={id} onRefresh={fetchBoardData} />
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
