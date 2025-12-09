import { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import useBoardStore from '../../store/boardStore';
import ListColumn from './ListColumn';
import { listApi, cardApi } from '../../api/services';
import { Plus, X, Loader } from 'lucide-react';

const BoardView = ({ boardId, onRefresh }) => {
  const { board, lists, listOrder, cards, moveCard, moveList, addList } = useBoardStore();
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'list') {
      // Optimistic update
      moveList(source.index, destination.index);
      
      // Persist to backend
      try {
        await listApi.updatePosition(draggableId, destination.index);
      } catch (err) {
        console.error('Failed to update list position:', err);
        toast.error('Failed to save list position');
        onRefresh?.(); // Revert on error
      }
      return;
    }

    // Card drag
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;
    
    // Optimistic update
    moveCard(sourceListId, destListId, source.index, destination.index, draggableId);
    
    // Persist to backend
    try {
      await cardApi.move(draggableId, {
        list_id: parseInt(destListId),
        position: destination.index
      });
    } catch (err) {
      console.error('Failed to move card:', err);
      toast.error('Failed to save card position');
      onRefresh?.(); // Revert on error
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    setAddingList(true);
    try {
      const { data } = await listApi.create({
        board_id: parseInt(boardId),
        title: newListTitle,
        position: listOrder.length
      });
      
      addList({
        id: String(data.id),
        title: data.title,
        position: data.position
      });
      
      setNewListTitle('');
      setShowAddList(false);
      toast.success('List created!');
    } catch (err) {
      console.error('Failed to create list:', err);
      toast.error('Failed to create list');
    } finally {
      setAddingList(false);
    }
  };

  const bgClass = board?.background || 'bg-gradient-to-br from-blue-500 to-indigo-600';

  return (
    <div className={`h-full overflow-x-auto overflow-y-hidden ${bgClass}`}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full items-start p-6"
            >
              {listOrder.map((listId, index) => {
                const list = lists[listId];
                if (!list) return null;
                const listCards = (list.cardIds || []).map((cardId) => cards[cardId]).filter(Boolean);
                
                return (
                  <ListColumn
                    key={listId}
                    list={list}
                    cards={listCards}
                    index={index}
                    boardId={boardId}
                    onRefresh={onRefresh}
                  />
                );
              })}
              {provided.placeholder}
              
              <div className="w-72 flex-shrink-0">
                {showAddList ? (
                  <form onSubmit={handleAddList} className="bg-gray-100 rounded-xl p-3">
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addingList}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {addingList && <Loader className="animate-spin" size={14} />}
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddList(false); setNewListTitle(''); }}
                        className="text-gray-500 hover:text-gray-700 p-1.5"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowAddList(true)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex items-center gap-2 transition-colors backdrop-blur-sm"
                  >
                    <Plus size={20} />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardView;
