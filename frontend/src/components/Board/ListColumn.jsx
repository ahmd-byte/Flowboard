import { Droppable, Draggable } from 'react-beautiful-dnd';
import CardItem from './CardItem';
import { MoreHorizontal, Plus } from 'lucide-react';

const ListColumn = ({ list, cards, index }) => {
  return (
    <Draggable draggableId={list.id.toString()} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col max-h-full mr-4 shadow-sm border border-gray-200/60"
        >
          <div 
             {...provided.dragHandleProps}
             className="p-3 px-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
             <h3 className="font-semibold text-gray-700 text-sm truncate">{list.title}</h3>
             <button className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200">
                <MoreHorizontal size={16} />
             </button>
          </div>

          <Droppable droppableId={list.id.toString()} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`px-2 pb-2 flex-1 overflow-y-auto min-h-[50px] transition-colors scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
              >
                {cards.map((card, index) => (
                  <CardItem key={card.id} card={card} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-3">
             <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 w-full p-2 rounded-lg text-sm transition-colors text-left">
                <Plus size={16} />
                <span>Add a card</span>
             </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default ListColumn;

