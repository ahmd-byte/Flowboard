import { useState, memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Clock, AlignLeft, AlertCircle, Bug, Sparkles, Zap, CheckCircle } from 'lucide-react';
import CardModal from './CardModal';

/**
 * Label configuration for card labels.
 * Defines available label types with their colors and icons.
 */
const LABEL_CONFIG = {
  'urgent': { name: 'Urgent', color: 'bg-red-500', icon: AlertCircle },
  'bug': { name: 'Bug', color: 'bg-orange-500', icon: Bug },
  'feature': { name: 'Feature', color: 'bg-blue-500', icon: Sparkles },
  'improvement': { name: 'Improvement', color: 'bg-purple-500', icon: Zap },
  'done': { name: 'Done', color: 'bg-emerald-500', icon: CheckCircle },
  'in-progress': { name: 'In Progress', color: 'bg-amber-500', icon: Clock },
};

/**
 * Card item component for displaying a card in a list.
 * 
 * Features:
 * - Drag and drop support
 * - Label display
 * - Due date status indicators
 * - Click to open card modal
 * 
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data object
 * @param {string|number} props.card.id - Card ID
 * @param {string} props.card.title - Card title
 * @param {string} props.card.description - Card description (optional)
 * @param {string|Array} props.card.labels - Card labels (JSON string or array)
 * @param {string} props.card.due_date - Due date in ISO format (optional)
 * @param {number} props.index - Index of card in the list (for drag and drop)
 * @param {Function} props.onRefresh - Callback to refresh card data
 * 
 * @example
 * <CardItem 
 *   card={{ id: 1, title: "Task", labels: ["urgent"], due_date: "2024-01-01" }}
 *   index={0}
 *   onRefresh={() => console.log("Refresh")}
 * />
 */
const CardItem = memo(({ card, index, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);

  // Parse labels from card
  const getLabels = () => {
    if (!card.labels) return [];
    try {
      return typeof card.labels === 'string' ? JSON.parse(card.labels) : card.labels;
    } catch {
      return [];
    }
  };

  const cardLabels = getLabels();

  // Check if due date is soon/overdue
  const getDueDateStatus = () => {
    if (!card.due_date) return null;
    const due = new Date(card.due_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    
    if (diff < 0) return { label: 'Overdue', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (diff === 0) return { label: 'Due today', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (diff <= 3) return { label: 'Due soon', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { 
      label: new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      class: 'bg-neutral-700/50 text-neutral-400 border-neutral-600' 
    };
  };

  const dueStatus = getDueDateStatus();

  return (
    <>
      <Draggable draggableId={card.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowModal(true)}
            className={`bg-neutral-800 p-3 rounded-xl mb-2 group cursor-pointer relative border border-neutral-700/50 transition-all duration-200
              ${snapshot.isDragging 
                ? 'shadow-2xl shadow-red-500/20 ring-2 ring-red-500 rotate-1 scale-105 z-50' 
                : 'hover:border-red-500/30 hover:bg-neutral-750 hover:shadow-lg hover:shadow-black/20'
              }`}
          >
            {/* Labels */}
            {cardLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cardLabels.map((labelId) => {
                  const label = LABEL_CONFIG[labelId];
                  if (!label) return null;
                  return (
                    <div 
                      key={labelId}
                      className={`h-2 w-8 rounded-full ${label.color}`}
                      title={label.name}
                    />
                  );
                })}
              </div>
            )}

            {/* Card Title */}
            <h4 className="text-sm font-medium text-neutral-200 leading-snug group-hover:text-white transition-colors">
              {card.title}
            </h4>
            
            {/* Card Footer - Due Date & Description indicator */}
            {(card.description || dueStatus) && (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {dueStatus && (
                  <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border ${dueStatus.class}`}>
                    <Clock size={10} />
                    <span className="font-medium">{dueStatus.label}</span>
                  </div>
                )}
                {card.description && (
                  <div className="text-neutral-500" title="Has description">
                    <AlignLeft size={14} />
                  </div>
                )}
              </div>
            )}

            {/* Drag indicator */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}
      </Draggable>

      {/* Card Modal */}
      <CardModal
        card={card}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdate={onRefresh}
        onDelete={onRefresh}
      />
    </>
  );
});

CardItem.displayName = 'CardItem';

export default CardItem;
