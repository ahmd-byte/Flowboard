import { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import useBoardStore from '../../store/boardStore';
import useUserStore from '../../store/userStore';
import ListColumn from './ListColumn';
import MembersModal from './MembersModal';
import OnlineUsers from './OnlineUsers';
import LiveCursors from './LiveCursors';
import useWebSocket from '../../hooks/useWebSocket';
import { listApi, cardApi } from '../../api/services';
import { exportAsJSON, exportAsPDF } from '../../utils/exportBoard';
import { Plus, X, Users, ArrowLeft, Wifi, WifiOff, Download, FileJson, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const BoardView = ({ boardId, onRefresh }) => {
  const { board, lists, listOrder, cards, moveCard, moveList, addList, addCard, updateCard, removeCard, removeList } = useBoardStore();
  const { user } = useUserStore();
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const boardRef = useRef(null);
  
  // WebSocket connection
  const { isConnected, onlineUsers, cursors, sendCursorPosition, registerHandler } = useWebSocket(boardId);

  // Handle real-time events from WebSocket
  useEffect(() => {
    const unsubscribeCardCreated = registerHandler('card_created', (card) => {
      addCard(String(card.list_id), {
        id: String(card.id),
        title: card.title,
        description: card.description,
        labels: card.labels || [],
        due_date: card.due_date
      });
    });

    const unsubscribeCardUpdated = registerHandler('card_updated', (card) => {
      updateCard(String(card.id), {
        title: card.title,
        description: card.description,
        labels: card.labels || [],
        due_date: card.due_date
      });
    });

    const unsubscribeCardDeleted = registerHandler('card_deleted', (payload) => {
      removeCard(payload.list_id, payload.card_id);
    });

    const unsubscribeCardMoved = registerHandler('card_moved', (payload) => {
      moveCard(payload.source_list_id, payload.dest_list_id, 0, payload.position, payload.card_id);
    });

    const unsubscribeListCreated = registerHandler('list_created', (list) => {
      addList({
        id: String(list.id),
        title: list.title,
        position: list.position
      });
    });

    const unsubscribeListDeleted = registerHandler('list_deleted', (payload) => {
      removeList(payload.list_id);
    });

    return () => {
      unsubscribeCardCreated();
      unsubscribeCardUpdated();
      unsubscribeCardDeleted();
      unsubscribeCardMoved();
      unsubscribeListCreated();
      unsubscribeListDeleted();
    };
  }, [registerHandler, addCard, updateCard, removeCard, moveCard, addList, removeList]);

  // Track cursor movement
  const handleMouseMove = useCallback((e) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    sendCursorPosition(x, y);
  }, [sendCursorPosition]);

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
    <div 
      ref={boardRef}
      onMouseMove={handleMouseMove}
      className={`h-full overflow-x-auto overflow-y-hidden ${bgClass}`}
    >
      {/* Live Cursors */}
      <LiveCursors cursors={cursors} />
      
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-black/30 backdrop-blur-sm border-b border-white/10 gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/"
            className="flex items-center gap-1 sm:gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <h1 className="text-base sm:text-xl font-bold text-white drop-shadow-lg truncate max-w-[150px] sm:max-w-none">
            {board?.title || 'Board'}
          </h1>
          {/* Connection Status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Online Users - hidden on very small screens */}
          <div className="hidden sm:block">
            <OnlineUsers users={onlineUsers} currentUserId={user?.id} />
          </div>
          
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 dark:bg-neutral-900 light:bg-white rounded-xl border border-neutral-700 dark:border-neutral-700 light:border-gray-200 shadow-xl overflow-hidden z-30 animate-scale-in">
                <button
                  onClick={() => {
                    exportAsJSON(board, lists, cards);
                    setShowExportMenu(false);
                    toast.success('Board exported as JSON!');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-neutral-300 dark:text-neutral-300 light:text-gray-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-gray-100 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors text-sm"
                >
                  <FileJson size={16} />
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    exportAsPDF(board, lists, cards);
                    setShowExportMenu(false);
                    toast.success('Opening print preview...');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-neutral-300 dark:text-neutral-300 light:text-gray-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-gray-100 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors text-sm"
                >
                  <FileText size={16} />
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Members</span>
          </button>
        </div>
      </div>

      {/* Board Content */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-[calc(100%-100px)] sm:h-[calc(100%-72px)] items-start p-3 sm:p-6 pt-4 overflow-x-auto"
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
              <div className="w-64 sm:w-72 flex-shrink-0">
                {showAddList ? (
                  <form onSubmit={handleAddList} className="bg-neutral-900/90 dark:bg-neutral-900/90 light:bg-white/90 backdrop-blur rounded-2xl p-3 border border-neutral-800 dark:border-neutral-800 light:border-gray-200">
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full p-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-800 light:bg-gray-50 border border-neutral-700 dark:border-neutral-700 light:border-gray-300 text-white dark:text-white light:text-gray-900 placeholder-neutral-500 dark:placeholder-neutral-500 light:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent mb-2"
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
                        className="text-neutral-400 dark:text-neutral-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 p-2 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowAddList(true)}
                    className="w-full bg-white/10 dark:bg-white/10 light:bg-gray-100 hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-gray-200 text-white dark:text-white light:text-gray-900 p-3.5 rounded-2xl flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-white/20 light:border-gray-300 group"
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
