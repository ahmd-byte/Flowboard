import { Draggable } from 'react-beautiful-dnd';
import { Calendar } from 'lucide-react';

const CardItem = ({ card, index }) => {
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
          className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 group cursor-pointer 
            ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 rotate-2 z-50' : 'hover:border-blue-300'}`}
        >
          <div className="flex justify-between items-start">
             <h4 className="text-sm font-medium text-gray-800 leading-snug">{card.title}</h4>
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
        </div>
      )}
    </Draggable>
  );
};

export default CardItem;

