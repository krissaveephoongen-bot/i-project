/**
 * Team Manager Component
 * Manage teams, members, and roles
 */

import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { teamService, Team, TeamMember } from '@/services/teamService';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const TeamManager: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newTeamData, setNewTeamData] = useState({ name: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState('member');
  const { can, isAdmin, isManager } = useRole();

  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await teamService.getTeams();
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleTeamSelect = async (team: Team) => {
    setSelectedTeam(team);
    try {
      const response = await teamService.getTeamMembers(team.id);
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to load team members');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      await teamService.createTeam(newTeamData);
      toast.success('Team created successfully');
      setNewTeamData({ name: '', description: '' });
      setShowNewTeamForm(false);
      loadTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await teamService.addTeamMember(selectedTeam.id, selectedUserId, selectedMemberRole);
      toast.success('Member added to team');
      setSelectedUserId('');
      setSelectedMemberRole('member');
      setShowAddMemberForm(false);
      handleTeamSelect(selectedTeam);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam || !window.confirm('Are you sure?')) return;

    try {
      await teamService.removeTeamMember(selectedTeam.id, userId);
      toast.success('Member removed from team');
      handleTeamSelect(selectedTeam);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const canManageTeams = can('create', 'team') || can('manage', 'team');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        {canManageTeams && (
          <button
            onClick={() => setShowNewTeamForm(!showNewTeamForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Team
          </button>
        )}
      </div>

      {/* New Team Form */}
      {showNewTeamForm && canManageTeams && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-bold mb-4">Create New Team</h3>
          <form onSubmit={handleCreateTeam} className="space-y-3">
            <input
              type="text"
              placeholder="Team Name"
              value={newTeamData.name}
              onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTeamData.description}
              onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewTeamForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="col-span-1">
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-gray-500">Loading teams...</p>
            ) : teams.length === 0 ? (
              <p className="text-gray-500">No teams found</p>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition ${
                    selectedTeam?.id === team.id
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-900">{team.name}</div>
                  <div className="text-sm text-gray-500">
                    {team.member_count || 0} members
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Details and Members */}
        <div className="col-span-2">
          {selectedTeam ? (
            <div className="border rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTeam.name}</h2>
                {selectedTeam.description && (
                  <p className="text-gray-600">{selectedTeam.description}</p>
                )}
                {selectedTeam.lead_name && (
                  <p className="text-sm text-gray-500 mt-2">
                    Lead: <span className="font-medium">{selectedTeam.lead_name}</span>
                  </p>
                )}
              </div>

              {/* Add Member Form */}
              {showAddMemberForm && canManageTeams && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-bold mb-3">Add Member</h4>
                  <form onSubmit={handleAddMember} className="space-y-3">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select User</option>
                      {allUsers
                        .filter((u) => !members.find((m) => m.id === u.id))
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                    </select>

                    <select
                      value={selectedMemberRole}
                      onChange={(e) => setSelectedMemberRole(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="lead">Lead</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMemberForm(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Team Members */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Members ({members.length})</h3>
                  {canManageTeams && (
                    <button
                      onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Member
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.email} • {member.team_role}
                        </div>
                      </div>
                      {canManageTeams && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a team to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
