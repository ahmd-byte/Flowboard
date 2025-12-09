import { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import useBoardStore from '../../store/boardStore';
import ListColumn from './ListColumn';
import MembersModal from './MembersModal';
import { listApi, cardApi } from '../../api/services';
import { Plus, X, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BoardView = ({ boardId, onRefresh }) => {
  const { board, lists, listOrder, cards, moveCard, moveList, addList } = useBoardStore();
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

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
      moveList(source.index, destination.index);
      
      try {
        await listApi.updatePosition(draggableId, destination.index);
      } catch (err) {
        console.error('Failed to update list position:', err);
        toast.error('Failed to save list position');
        onRefresh?.();
      }
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;
    
    moveCard(sourceListId, destListId, source.index, destination.index, draggableId);
    
    try {
      await cardApi.move(draggableId, {
        list_id: parseInt(destListId),
        position: destination.index
      });
    } catch (err) {
      console.error('Failed to move card:', err);
      toast.error('Failed to save card position');
      onRefresh?.();
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

  const bgClass = board?.background || 'bg-gradient-to-br from-red-600 to-black';

  return (
    <div className={`h-full overflow-x-auto overflow-y-hidden ${bgClass}`}>
      {/* Board Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link 
            to="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <h1 className="text-xl font-bold text-white drop-shadow-lg">
            {board?.title || 'Board'}
          </h1>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
        >
          <Users size={16} />
          Members
        </button>
      </div>

      {/* Board Content */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-[calc(100%-72px)] items-start p-6 pt-4"
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
                    onRefresh={onRefresh}
                  />
                );
              })}
              {provided.placeholder}
              
              {/* Add List */}
              <div className="w-72 flex-shrink-0">
                {showAddList ? (
                  <form onSubmit={handleAddList} className="bg-neutral-900/90 backdrop-blur rounded-2xl p-3 border border-neutral-800">
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addingList}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1 shadow-lg shadow-red-600/20"
                      >
                        {addingList ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Plus size={14} />
                            Add List
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddList(false); setNewListTitle(''); }}
                        className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-xl transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowAddList(true)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white p-3.5 rounded-2xl flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/20 group"
                  >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">Add another list</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Members Modal */}
      <MembersModal
        boardId={boardId}
        boardTitle={board?.title || 'Board'}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
      />
    </div>
  );
};

export default BoardView;
