import React, { useState, useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['G', 'D'], description: 'Go to Dashboard' },
        { keys: ['G', 'P'], description: 'Go to Profile' },
        { keys: ['G', 'S'], description: 'Go to Settings' },
        { keys: ['/'], description: 'Focus search' },
      ]
    },
    {
      category: 'Board Actions',
      items: [
        { keys: ['N'], description: 'New card (when list is focused)' },
        { keys: ['E'], description: 'Edit card (when card is focused)' },
        { keys: ['Delete'], description: 'Delete card (when card is focused)' },
        { keys: ['Esc'], description: 'Close modal/dialog' },
      ]
    },
    {
      category: 'General',
      items: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Ctrl', 'K'], description: 'Open search' },
        { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
      ]
    }
  ];

  const formatKey = (key) => {
    if (key === 'Ctrl') return isMac ? '⌘' : 'Ctrl';
    if (key === 'Command') return '⌘';
    if (key === 'Delete') return 'Del';
    if (key === 'Esc') return 'Esc';
    return key.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/60 light:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-neutral-900 dark:bg-neutral-900 light:bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-neutral-800 dark:border-neutral-800 light:border-gray-200 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Keyboard size={20} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white dark:text-white light:text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-500 dark:text-neutral-500 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-neutral-400 dark:text-neutral-400 light:text-gray-600 mb-3 uppercase tracking-wider">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-neutral-300 dark:text-neutral-300 light:text-gray-700">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-2 py-1 bg-neutral-800 dark:bg-neutral-800 light:bg-gray-100 border border-neutral-700 dark:border-neutral-700 light:border-gray-300 rounded text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-gray-700">
                            {formatKey(key)}
                          </kbd>
                          {keyIdx < item.keys.length - 1 && (
                            <span className="text-neutral-500 dark:text-neutral-500 light:text-gray-400 mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-800 dark:border-neutral-800 light:border-gray-200 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-neutral-800 dark:bg-neutral-800 light:bg-gray-100 border border-neutral-700 dark:border-neutral-700 light:border-gray-300 rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

