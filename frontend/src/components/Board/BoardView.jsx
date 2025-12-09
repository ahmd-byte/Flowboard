import { useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import useBoardStore from '../../store/boardStore';
import ListColumn from './ListColumn';
import { Plus } from 'lucide-react';

const BoardView = ({ boardId }) => {
  const { lists, listOrder, cards, moveCard, moveList } = useBoardStore();

  const onDragEnd = (result) => {
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
      return;
    }

    moveCard(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
      draggableId
    );
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full items-start p-6 space-x-4"
            >
              {listOrder.map((listId, index) => {
                const list = lists[listId];
                if (!list) return null;
                const listCards = list.cardIds.map((cardId) => cards[cardId]).filter(Boolean);
                
                return (
                  <ListColumn
                    key={listId}
                    list={list}
                    cards={listCards}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
              
              <div className="w-72 flex-shrink-0">
                <button className="w-full bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex items-center gap-2 transition-colors backdrop-blur-sm">
                   <Plus size={20} />
                   <span>Add another list</span>
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardView;

