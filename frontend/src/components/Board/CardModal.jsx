import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { cardApi } from '../../api/services';
import { 
  X, Calendar, Tag, AlignLeft, Clock, Trash2, Save, Loader,
  CheckCircle, AlertCircle, Zap, Bug, Sparkles, Circle
} from 'lucide-react';

// Available labels
const AVAILABLE_LABELS = [
  { id: 'urgent', name: 'Urgent', color: 'bg-red-500', textColor: 'text-red-500', icon: AlertCircle },
  { id: 'bug', name: 'Bug', color: 'bg-orange-500', textColor: 'text-orange-500', icon: Bug },
  { id: 'feature', name: 'Feature', color: 'bg-blue-500', textColor: 'text-blue-500', icon: Sparkles },
  { id: 'improvement', name: 'Improvement', color: 'bg-purple-500', textColor: 'text-purple-500', icon: Zap },
  { id: 'done', name: 'Done', color: 'bg-emerald-500', textColor: 'text-emerald-500', icon: CheckCircle },
  { id: 'in-progress', name: 'In Progress', color: 'bg-amber-500', textColor: 'text-amber-500', icon: Clock },
];

const CardModal = ({ card, isOpen, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setDueDate(card.due_date ? card.due_date.split('T')[0] : '');
      // Parse labels from card (stored as JSON string or array)
      try {
        const cardLabels = card.labels ? (typeof card.labels === 'string' ? JSON.parse(card.labels) : card.labels) : [];
        setLabels(cardLabels);
      } catch {
        setLabels([]);
      }
    }
  }, [card]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        labels: JSON.stringify(labels),
      };
      
      await cardApi.update(card.id, updateData);
      toast.success('Card updated!');
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error('Failed to update card:', err);
      toast.error('Failed to update card');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    setDeleting(true);
    try {
      await cardApi.delete(card.id);
      toast.success('Card deleted!');
      onDelete?.();
      onClose();
    } catch (err) {
      console.error('Failed to delete card:', err);
      toast.error('Failed to delete card');
    } finally {
      setDeleting(false);
    }
  };

  const toggleLabel = (labelId) => {
    setLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(l => l !== labelId)
        : [...prev, labelId]
    );
  };

  const getDueDateStatus = () => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    
    if (diff < 0) return { text: 'Overdue', class: 'text-red-500 bg-red-500/10' };
    if (diff === 0) return { text: 'Due today', class: 'text-amber-500 bg-amber-500/10' };
    if (diff <= 3) return { text: 'Due soon', class: 'text-yellow-500 bg-yellow-500/10' };
    return null;
  };

  const dueDateStatus = getDueDateStatus();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-neutral-800 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder-neutral-500"
              placeholder="Card title..."
            />
            {/* Labels display */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {labels.map(labelId => {
                  const label = AVAILABLE_LABELS.find(l => l.id === labelId);
                  if (!label) return null;
                  return (
                    <span 
                      key={labelId}
                      className={`${label.color} text-white text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5`}
                    >
                      <label.icon size={12} />
                      {label.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-2 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Labels Section */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-3">
              <Tag size={16} />
              Labels
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 text-sm hover:border-red-500/50 transition-colors flex items-center gap-2"
              >
                <Circle size={14} />
                {labels.length > 0 ? `${labels.length} label(s) selected` : 'Add labels'}
              </button>
              
              {showLabelPicker && (
                <div className="absolute top-full left-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-xl p-3 shadow-xl z-10 w-64">
                  <div className="text-xs font-medium text-neutral-500 mb-2">Select labels</div>
                  <div className="space-y-1">
                    {AVAILABLE_LABELS.map(label => (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          labels.includes(label.id) 
                            ? 'bg-neutral-700 text-white' 
                            : 'text-neutral-300 hover:bg-neutral-700/50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded ${label.color}`} />
                        <span className="flex-1">{label.name}</span>
                        {labels.includes(label.id) && <CheckCircle size={14} className="text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowLabelPicker(false)}
                    className="w-full mt-2 px-3 py-2 text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-3">
              <Calendar size={16} />
              Due Date
              {dueDateStatus && (
                <span className={`text-xs px-2 py-0.5 rounded-md ${dueDateStatus.class}`}>
                  {dueDateStatus.text}
                </span>
              )}
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-3">
              <AlignLeft size={16} />
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              placeholder="Add a more detailed description..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {deleting ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
            Delete Card
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;

