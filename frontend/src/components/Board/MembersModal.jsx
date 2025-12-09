import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { X, UserPlus, Mail, Users, Loader, Trash2, Crown, Edit3, Eye } from 'lucide-react';

const ROLE_ICONS = {
  owner: Crown,
  admin: Edit3,
  editor: Edit3,
  viewer: Eye
};

const ROLE_COLORS = {
  owner: 'text-amber-500 bg-amber-500/10',
  admin: 'text-red-500 bg-red-500/10',
  editor: 'text-emerald-500 bg-emerald-500/10',
  viewer: 'text-neutral-400 bg-neutral-500/10'
};

const MembersModal = ({ boardId, boardTitle, isOpen, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/roles/board/${boardId}/members`);
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      await api.post(`/roles/board/${boardId}/invite`, {
        email: inviteEmail,
        role: inviteRole
      });
      toast.success(`Invited ${inviteEmail} to the board!`);
      setInviteEmail('');
      fetchMembers();
    } catch (err) {
      console.error('Failed to invite:', err);
      const msg = err.response?.data?.detail || 'Failed to invite member';
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (roleId, memberName) => {
    if (!confirm(`Remove ${memberName} from this board?`)) return;
    
    try {
      await api.delete(`/roles/${roleId}`);
      toast.success(`Removed ${memberName} from board`);
      fetchMembers();
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error('Failed to remove member');
    }
  };

  // Fetch members when modal opens
  if (isOpen && members.length === 0 && !loading) {
    fetchMembers();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-800 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Board Members</h2>
                <p className="text-sm text-white/70">{boardTitle}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="hover:bg-white/20 p-2 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite..."
                className="w-full pl-10 pr-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20"
            >
              {inviting ? <Loader className="animate-spin" size={16} /> : <UserPlus size={16} />}
              Invite
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin text-red-500" size={24} />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users size={40} className="mx-auto text-neutral-600 mb-3" />
              <p className="text-neutral-500">No members yet</p>
              <p className="text-neutral-600 text-sm">Invite someone to collaborate!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role] || Eye;
                const roleStyle = ROLE_COLORS[member.role] || 'text-neutral-400 bg-neutral-500/10';
                
                return (
                  <div 
                    key={`${member.user_id}-${member.role}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/20">
                        {member.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{member.user_name}</p>
                        <p className="text-sm text-neutral-500">{member.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${roleStyle}`}>
                        <RoleIcon size={12} />
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      {member.role !== 'owner' && member.id !== 0 && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user_name)}
                          className="text-neutral-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 text-red-400">
              <Edit3 size={12} />
              <span><strong>Admin</strong> - Full access</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Edit3 size={12} />
              <span><strong>Editor</strong> - Edit cards</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Eye size={12} />
              <span><strong>Viewer</strong> - Read only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
