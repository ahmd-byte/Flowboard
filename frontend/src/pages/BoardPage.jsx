import { useParams } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import BoardView from '../components/Board/BoardView';
import useBoardStore from '../store/boardStore';
import { useEffect } from 'react';

const BoardPage = () => {
  const { id } = useParams();
  const setBoardData = useBoardStore(state => state.setBoardData);
  
  useEffect(() => {
    // Simulate fetching data for demo
    // In real app, this would be an API call
    const demoData = {
        board: { id: id, title: 'Demo Board' },
        lists: {
            'l1': { id: 'l1', title: 'To Do', cardIds: ['c1', 'c2'] },
            'l2': { id: 'l2', title: 'In Progress', cardIds: ['c3'] },
            'l3': { id: 'l3', title: 'Done', cardIds: [] },
        },
        cards: {
            'c1': { id: 'c1', list_id: 'l1', title: 'Research competitors', due_date: new Date().toISOString() },
            'c2': { id: 'c2', list_id: 'l1', title: 'Draft proposal' },
            'c3': { id: 'c3', list_id: 'l2', title: 'Client meeting', description: 'Discuss requirements' },
        },
        listOrder: ['l1', 'l2', 'l3']
    };
    setBoardData(demoData);
  }, [id, setBoardData]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Topbar />
        <div className="flex-1 ml-64 overflow-hidden relative">
            <BoardView boardId={id} />
        </div>
      </div>
    </div>
  );
};
export default BoardPage;

