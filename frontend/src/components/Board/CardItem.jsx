import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { cardApi } from '../../api/services';
import { Calendar, Trash2, X, Clock, Tag } from 'lucide-react';

// Sample labels for demo
const CARD_LABELS = [
  { id: 1, name: 'Urgent', color: 'label-red' },
  { id: 2, name: 'Feature', color: 'label-blue' },
  { id: 3, name: 'Bug', color: 'label-orange' },
  { id: 4, name: 'Done', color: 'label-green' },
];

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

  // Generate random labels for demo (in real app, this would come from card data)
  const cardLabels = CARD_LABELS.filter((_, i) => (parseInt(card.id) + i) % 3 === 0).slice(0, 2);
  
  // Check if due date is soon/overdue
  const getDueDateStatus = () => {
    if (!card.due_date) return null;
    const due = new Date(card.due_date);
    const now = new Date();
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    
    if (diff < 0) return { label: 'Overdue', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (diff < 1) return { label: 'Due today', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (diff < 3) return { label: 'Due soon', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: new Date(card.due_date).toLocaleDateString(), class: 'bg-neutral-700/50 text-neutral-400 border-neutral-600' };
  };

  const dueStatus = getDueDateStatus();

  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-neutral-800 p-3 rounded-xl mb-2 group cursor-pointer relative border border-neutral-700/50 transition-all duration-300
            ${snapshot.isDragging 
              ? 'shadow-2xl shadow-red-500/20 ring-2 ring-red-500 rotate-2 scale-105 z-50' 
              : 'hover:border-red-500/30 hover:bg-neutral-750'
            }`}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
          {/* Labels */}
          {cardLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {cardLabels.map((label) => (
                <span 
                  key={label.id}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${label.color}`}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Card Title */}
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-neutral-200 leading-snug pr-6 group-hover:text-white transition-colors">
              {card.title}
            </h4>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="absolute top-2 right-2 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-500/10 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          {/* Card Footer - Due Date & Info */}
          {(card.description || card.due_date || dueStatus) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {dueStatus && (
                <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border ${dueStatus.class}`}>
                  <Clock size={10} />
                  <span className="font-medium">{dueStatus.label}</span>
                </div>
              )}
              {card.description && (
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Tag size={10} />
                  <span>Has description</span>
                </div>
              )}
            </div>
          )}

          {/* Drag indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Delete Menu */}
          {showMenu && (
            <div 
              className="absolute top-0 right-0 mt-8 bg-neutral-900 rounded-xl shadow-xl border border-neutral-700 py-1 z-20 w-32 animate-scale-in"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); handleDelete(); }}
                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-neutral-400 hover:bg-neutral-800 flex items-center gap-2 transition-colors"
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
