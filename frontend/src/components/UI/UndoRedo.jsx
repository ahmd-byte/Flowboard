import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useHistoryStore from '../../store/historyStore';
import { Undo2, Redo2 } from 'lucide-react';

const UndoRedo = ({ onUndo, onRedo }) => {
  const { canUndo, canRedo, undo, redo } = useHistoryStore();

  const handleUndo = useCallback(() => {
    if (!canUndo()) return;
    const action = undo();
    if (action && onUndo) {
      onUndo(action);
      toast('Action undone', { icon: '↩️' });
    }
  }, [canUndo, undo, onUndo]);

  const handleRedo = useCallback(() => {
    if (!canRedo()) return;
    const action = redo();
    if (action && onRedo) {
      onRedo(action);
      toast('Action redone', { icon: '↪️' });
    }
  }, [canRedo, redo, onRedo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex items-center gap-1 bg-neutral-800/50 rounded-lg p-1">
      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className={`p-2 rounded-lg transition-all ${
          canUndo() 
            ? 'text-neutral-300 hover:text-white hover:bg-neutral-700' 
            : 'text-neutral-600 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className={`p-2 rounded-lg transition-all ${
          canRedo() 
            ? 'text-neutral-300 hover:text-white hover:bg-neutral-700' 
            : 'text-neutral-600 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
};

export default UndoRedo;

