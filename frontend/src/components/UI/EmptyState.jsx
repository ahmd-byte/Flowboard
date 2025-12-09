import { Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Users, FolderOpen, Inbox, Search } from 'lucide-react';

const illustrations = {
  boards: (
    <svg viewBox="0 0 200 150" className="w-48 h-36">
      <rect x="20" y="30" width="50" height="90" rx="8" fill="#262626" stroke="#dc2626" strokeWidth="2"/>
      <rect x="30" y="45" width="30" height="8" rx="2" fill="#404040"/>
      <rect x="30" y="60" width="25" height="6" rx="2" fill="#525252"/>
      <rect x="30" y="75" width="30" height="6" rx="2" fill="#525252"/>
      
      <rect x="80" y="30" width="50" height="90" rx="8" fill="#262626" stroke="#404040" strokeWidth="2"/>
      <rect x="90" y="45" width="30" height="8" rx="2" fill="#404040"/>
      <rect x="90" y="60" width="20" height="6" rx="2" fill="#525252"/>
      
      <rect x="140" y="30" width="50" height="90" rx="8" fill="#262626" stroke="#404040" strokeWidth="2"/>
      <rect x="150" y="45" width="30" height="8" rx="2" fill="#404040"/>
      
      <circle cx="100" cy="130" r="15" fill="#dc2626" opacity="0.2"/>
      <path d="M95 130h10M100 125v10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  search: (
    <svg viewBox="0 0 200 150" className="w-48 h-36">
      <circle cx="80" cy="60" r="35" fill="none" stroke="#404040" strokeWidth="4"/>
      <line x1="105" y1="85" x2="140" y2="120" stroke="#404040" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="80" cy="60" r="20" fill="#262626"/>
      <path d="M70 55 L75 65 L90 50" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  team: (
    <svg viewBox="0 0 200 150" className="w-48 h-36">
      <circle cx="100" cy="50" r="25" fill="#dc2626" opacity="0.2"/>
      <circle cx="100" cy="45" r="15" fill="#404040"/>
      <ellipse cx="100" cy="85" rx="25" ry="15" fill="#404040"/>
      
      <circle cx="50" cy="60" r="18" fill="#262626"/>
      <circle cx="50" cy="55" r="10" fill="#525252"/>
      <ellipse cx="50" cy="85" rx="18" ry="10" fill="#525252"/>
      
      <circle cx="150" cy="60" r="18" fill="#262626"/>
      <circle cx="150" cy="55" r="10" fill="#525252"/>
      <ellipse cx="150" cy="85" rx="18" ry="10" fill="#525252"/>
    </svg>
  ),
  
  inbox: (
    <svg viewBox="0 0 200 150" className="w-48 h-36">
      <rect x="40" y="40" width="120" height="80" rx="8" fill="#262626" stroke="#404040" strokeWidth="2"/>
      <path d="M40 70 L100 100 L160 70" stroke="#404040" strokeWidth="2" fill="none"/>
      <rect x="60" y="55" width="40" height="4" rx="2" fill="#dc2626"/>
      <rect x="60" y="65" width="60" height="3" rx="1" fill="#525252"/>
    </svg>
  ),
};

const EmptyState = ({ 
  type = 'boards',
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel = 'Create New',
  onAction,
  actionLink
}) => {
  const Action = actionLink ? Link : 'button';
  const actionProps = actionLink ? { to: actionLink } : { onClick: onAction };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="mb-6 opacity-60">
        {illustrations[type] || illustrations.boards}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-neutral-500 text-center max-w-md mb-6">{description}</p>
      
      {(onAction || actionLink) && (
        <Action
          {...actionProps}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50"
        >
          <Plus size={18} />
          {actionLabel}
        </Action>
      )}
    </div>
  );
};

export default EmptyState;

