/**
 * Team Management Component
 * Add/Remove members from projects
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import teamService from '../../services/teamService';
import './TeamManagement.css';

function TeamManagement({ projectId }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('member');
    const [submitting, setSubmitting] = useState(false);

    // Load members on mount
    useEffect(() => {
        loadMembers();
        loadAvailableUsers();
    }, [projectId]);

    async function loadMembers() {
        try {
            setLoading(true);
            const response = await teamService.getProjectMembers(projectId);
            setMembers(response.members || []);
        } catch (error) {
            toast.error('Failed to load team members');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function loadAvailableUsers() {
        try {
            // This should call a user service to get all users
            // For now, we'll leave this as a placeholder
            // const response = await userService.getAllUsers();
            // setUsers(response.users || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    async function handleAddMember(e) {
        e.preventDefault();
        if (!selectedUser) {
            toast.error('Please select a user');
            return;
        }

        try {
            setSubmitting(true);
            await teamService.addMember(projectId, selectedUser, selectedRole);
            toast.success('Member added successfully');
            setSelectedUser('');
            setSelectedRole('member');
            setShowAddModal(false);
            await loadMembers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add member');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRemoveMember(userId) {
        if (!window.confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            await teamService.removeMember(projectId, userId);
            toast.success('Member removed successfully');
            await loadMembers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to remove member');
        }
    }

    async function handleRoleChange(userId, newRole) {
        try {
            await teamService.updateMemberRole(projectId, userId, newRole);
            toast.success('Member role updated');
            await loadMembers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update role');
        }
    }

    return (
        <div className="team-management">
            <div className="team-header">
                <h2>Team Members</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Add Member
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading team members...</div>
            ) : members.length === 0 ? (
                <div className="empty-state">
                    <UserPlus size={48} />
                    <p>No members yet. Add your first team member!</p>
                </div>
            ) : (
                <div className="members-grid">
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-header">
                                <div className="member-info">
                                    <h3>{member.name}</h3>
                                    <p>{member.email}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveMember(member.user_id)}
                                    className="btn-icon btn-danger"
                                    title="Remove member"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="member-details">
                                <p>
                                    <strong>Department:</strong> {member.department || 'N/A'}
                                </p>
                                <p>
                                    <strong>Position:</strong> {member.position || 'N/A'}
                                </p>
                            </div>
                            <div className="member-role">
                                <label>Role:</label>
                                <select
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                                    className="role-select"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="member">Member</option>
                                    <option value="lead">Lead</option>
                                </select>
                            </div>
                            <p className="member-date">
                                Added: {new Date(member.assigned_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add Team Member</h3>
                        <form onSubmit={handleAddMember}>
                            <div className="form-group">
                                <label>Select User</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose user --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="member">Member</option>
                                    <option value="lead">Lead</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-secondary"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Adding...' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamManagement;
