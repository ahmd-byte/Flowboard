import { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import CardItem from './CardItem';
import useBoardStore from '../../store/boardStore';
import { cardApi, listApi } from '../../api/services';
import { MoreHorizontal, Plus, X, Loader, Trash2 } from 'lucide-react';

const ListColumn = ({ list, cards, index, boardId, onRefresh }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingCard, setAddingCard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  
  const addCard = useBoardStore(state => state.addCard);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    
    setAddingCard(true);
    try {
      const { data } = await cardApi.create({
        list_id: parseInt(list.id),
        title: newCardTitle,
        position: cards.length
      });
      
      addCard({
        id: String(data.id),
        list_id: String(data.list_id),
        title: data.title,
        description: data.description,
        position: data.position,
        due_date: data.due_date
      });
      
      setNewCardTitle('');
      setShowAddCard(false);
      toast.success('Card created!');
    } catch (err) {
      console.error('Failed to create card:', err);
      toast.error('Failed to create card');
    } finally {
      setAddingCard(false);
    }
  };

  const handleDeleteList = async () => {
    if (!confirm('Delete this list and all its cards?')) return;
    
    try {
      await listApi.delete(list.id);
      toast.success('List deleted');
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete list:', err);
      toast.error('Failed to delete list');
    }
  };

  const handleUpdateTitle = async () => {
    if (!editTitle.trim() || editTitle === list.title) {
      setIsEditing(false);
      setEditTitle(list.title);
      return;
    }
    
    try {
      await listApi.update(list.id, { title: editTitle });
      list.title = editTitle; // Optimistic update
      setIsEditing(false);
      toast.success('List updated');
    } catch (err) {
      console.error('Failed to update list:', err);
      toast.error('Failed to update list');
      setEditTitle(list.title);
    }
  };

  return (
    <Draggable draggableId={list.id.toString()} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col max-h-[calc(100vh-180px)] mr-4 shadow-sm border border-gray-200/60"
        >
          <div 
            {...provided.dragHandleProps}
            className="p-3 px-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                className="font-semibold text-gray-700 text-sm bg-white border rounded px-2 py-1 w-full mr-2"
                autoFocus
              />
            ) : (
              <h3 
                onClick={() => setIsEditing(true)}
                className="font-semibold text-gray-700 text-sm truncate cursor-text hover:bg-gray-200 px-1 py-0.5 rounded -mx-1"
              >
                {list.title}
              </h3>
            )}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 w-40">
                  <button
                    onClick={() => { setShowMenu(false); handleDeleteList(); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete list
                  </button>
                </div>
              )}
            </div>
          </div>

          <Droppable droppableId={list.id.toString()} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`px-2 pb-2 flex-1 overflow-y-auto min-h-[50px] transition-colors scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
              >
                {cards.map((card, index) => (
                  <CardItem key={card.id} card={card} index={index} onRefresh={onRefresh} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-2">
            {showAddCard ? (
              <form onSubmit={handleAddCard} className="bg-white rounded-lg p-2 shadow-sm">
                <textarea
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter a title for this card..."
                  className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={addingCard}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {addingCard && <Loader className="animate-spin" size={14} />}
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddCard(false); setNewCardTitle(''); }}
                    className="text-gray-500 hover:text-gray-700 p-1.5"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddCard(true)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 w-full p-2 rounded-lg text-sm transition-colors text-left"
              >
                <Plus size={16} />
                <span>Add a card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default ListColumn;
