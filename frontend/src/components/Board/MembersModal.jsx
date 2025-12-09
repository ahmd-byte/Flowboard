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
  owner: 'text-yellow-500',
  admin: 'text-purple-500',
  editor: 'text-blue-500',
  viewer: 'text-gray-500'
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users size={20} />
              <h2 className="text-lg font-semibold">Board Members</h2>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1">{boardTitle}</p>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
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
              <Loader className="animate-spin text-purple-500" size={24} />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No members yet. Invite someone!</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role] || Eye;
                const roleColor = ROLE_COLORS[member.role] || 'text-gray-500';
                
                return (
                  <div 
                    key={`${member.user_id}-${member.role}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.user_name}</p>
                        <p className="text-sm text-gray-500">{member.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-sm font-medium ${roleColor}`}>
                        <RoleIcon size={14} />
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      {member.role !== 'owner' && member.id !== 0 && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user_name)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
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
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
          <p><strong>Admin:</strong> Full access, can invite members</p>
          <p><strong>Editor:</strong> Can create and edit cards</p>
          <p><strong>Viewer:</strong> Read-only access</p>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;

