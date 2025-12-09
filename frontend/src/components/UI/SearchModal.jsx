import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutDashboard, FileText, Loader } from 'lucide-react';
import { boardApi } from '../../api/services';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ boards: [], cards: [] });
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({ boards: [], cards: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      fetchAllData();
    } else {
      setQuery('');
      setResults({ boards: [], cards: [] });
    }
  }, [isOpen]);

  // Fetch all boards and cards for searching
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: boards } = await boardApi.getAll();
      
      // Fetch cards from all boards
      const allCards = [];
      for (const board of boards) {
        try {
          const { data: fullBoard } = await boardApi.getFull(board.id);
          if (fullBoard.cards) {
            Object.values(fullBoard.cards).forEach(card => {
              allCards.push({ ...card, boardId: board.id, boardTitle: board.title });
            });
          }
        } catch (err) {
          console.error(`Failed to fetch board ${board.id}:`, err);
        }
      }
      
      setAllData({ boards, cards: allCards });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ boards: [], cards: [] });
      return;
    }

    const q = query.toLowerCase();
    
    const filteredBoards = allData.boards.filter(board => 
      board.title.toLowerCase().includes(q)
    ).slice(0, 5);

    const filteredCards = allData.cards.filter(card => 
      card.title.toLowerCase().includes(q) || 
      card.description?.toLowerCase().includes(q)
    ).slice(0, 10);

    setResults({ boards: filteredBoards, cards: filteredCards });
  }, [query, allData]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults = results.boards.length > 0 || results.cards.length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 pt-[15vh] px-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-neutral-800 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
          <Search size={20} className="text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards and cards..."
            className="flex-1 bg-transparent text-white text-lg placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-neutral-500 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-neutral-500 bg-neutral-800 rounded border border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-red-500" size={24} />
            </div>
          ) : !query.trim() ? (
            <div className="py-12 text-center text-neutral-500">
              <Search size={40} className="mx-auto mb-3 opacity-50" />
              <p>Start typing to search...</p>
              <p className="text-sm mt-1">Search across all your boards and cards</p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-neutral-500">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Boards */}
              {results.boards.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Boards
                  </div>
                  {results.boards.map(board => (
                    <button
                      key={board.id}
                      onClick={() => handleNavigate(`/board/${board.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-neutral-800 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${board.background || 'bg-gradient-to-br from-red-600 to-red-900'} flex items-center justify-center`}>
                        <LayoutDashboard size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-red-400 transition-colors">
                          {board.title}
                        </div>
                        <div className="text-xs text-neutral-500">Board</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Cards */}
              {results.cards.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cards
                  </div>
                  {results.cards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleNavigate(`/board/${card.boardId}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-neutral-800 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <FileText size={18} className="text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium group-hover:text-red-400 transition-colors truncate">
                          {card.title}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          in {card.boardTitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700">↵</kbd>
              to select
            </span>
          </div>
          <span>
            {hasResults && `${results.boards.length + results.cards.length} results`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

