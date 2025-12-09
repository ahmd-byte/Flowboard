import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { cardApi } from '../../api/services';
import { Calendar, Trash2, X } from 'lucide-react';

const CardItem = ({ card, index, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    
    try {
      await cardApi.delete(card.id);
      toast.success('Card deleted');
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete card:', err);
      toast.error('Failed to delete card');
    }
  };

  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
          className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 group cursor-pointer relative
            ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 rotate-2 z-50' : 'hover:border-blue-300'}`}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-gray-800 leading-snug pr-6">{card.title}</h4>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          {(card.description || card.due_date) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {card.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(card.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Delete confirmation popup */}
          {showMenu && (
            <div 
              className="absolute top-0 right-0 mt-8 bg-white rounded-lg shadow-lg border py-1 z-20 w-32"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); handleDelete(); }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default CardItem;
