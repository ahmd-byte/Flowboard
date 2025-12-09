import { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import CardItem from './CardItem';
import useBoardStore from '../../store/boardStore';
import { cardApi, listApi } from '../../api/services';
import { MoreHorizontal, Plus, X, Trash2, GripVertical } from 'lucide-react';

const ListColumn = ({ list, cards, index, onRefresh }) => {
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
      list.title = editTitle;
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
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`w-72 flex-shrink-0 bg-neutral-900/90 backdrop-blur rounded-2xl flex flex-col max-h-[calc(100vh-200px)] mr-4 border border-neutral-800 transition-all duration-300 ${
            snapshot.isDragging ? 'shadow-2xl shadow-red-500/20 ring-2 ring-red-500' : ''
          }`}
        >
          {/* List Header */}
          <div 
            {...provided.dragHandleProps}
            className="p-3 px-4 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-neutral-800"
          >
            <div className="flex items-center gap-2 flex-1">
              <GripVertical size={14} className="text-neutral-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  className="font-semibold text-white text-sm bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <h3 
                    onClick={() => setIsEditing(true)}
                    className="font-semibold text-white text-sm truncate cursor-text hover:text-red-400 transition-colors"
                  >
                    {list.title}
                  </h3>
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-neutral-500 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-neutral-800 rounded-xl shadow-xl border border-neutral-700 py-1 z-10 w-40 animate-scale-in">
                  <button
                    onClick={() => { setShowMenu(false); handleDeleteList(); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete list
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cards Container */}
          <Droppable droppableId={list.id.toString()} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`px-2 py-2 flex-1 overflow-y-auto min-h-[60px] transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-red-500/5' : ''
                }`}
              >
                {cards.map((card, index) => (
                  <CardItem key={card.id} card={card} index={index} onRefresh={onRefresh} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card Section */}
          <div className="p-2 border-t border-neutral-800">
            {showAddCard ? (
              <form onSubmit={handleAddCard} className="bg-neutral-800 rounded-xl p-2">
                <textarea
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                  className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={addingCard}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1 shadow-lg shadow-red-600/20"
                  >
                    {addingCard ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} />
                        Add
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddCard(false); setNewCardTitle(''); }}
                    className="text-neutral-400 hover:text-white p-1.5 hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddCard(true)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white hover:bg-neutral-800 w-full p-2.5 rounded-xl text-sm transition-all duration-200 text-left group"
              >
                <Plus size={16} className="group-hover:text-red-500 transition-colors" />
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
