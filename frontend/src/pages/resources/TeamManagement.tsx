import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Users,
  UserPlus,
  Trash2,
  Search,
  MoreVertical,
  ChevronDown,
  Calendar,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService, Team, TeamMember } from '@/services/teamService';
import { userService } from '@/services/userService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface TeamWithMembers extends Team {
  members: TeamMember[];
  memberCount: number;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newTeamData, setNewTeamData] = useState({ name: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState('member');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTeams(), loadUsers()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams();
      const teamsWithMembers = await Promise.all(
        response.data.map(async (team) => {
          try {
            const membersResponse = await teamService.getTeamMembers(team.id);
            return {
              ...team,
              members: membersResponse.data || [],
              memberCount: membersResponse.data?.length || 0,
            };
          } catch {
            return {
              ...team,
              members: [],
              memberCount: 0,
            };
          }
        })
      );
      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      setAllUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const response = await teamService.createTeam(newTeamData);
      toast.success('Team created successfully');
      setNewTeamData({ name: '', description: '' });
      setShowNewTeamModal(false);
      await loadTeams();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create team');
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
      toast.success('Member added successfully');
      setSelectedUserId('');
      setSelectedMemberRole('member');
      setShowAddMemberModal(false);
      await loadTeams();
      // Refresh selected team
      const updated = teams.find((t) => t.id === selectedTeam.id);
      if (updated) setSelectedTeam(updated);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam || !window.confirm('Remove this member from the team?')) return;

    try {
      await teamService.removeTeamMember(selectedTeam.id, memberId);
      toast.success('Member removed');
      await loadTeams();
      const updated = teams.find((t) => t.id === selectedTeam.id);
      if (updated) setSelectedTeam(updated);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Delete this team? This cannot be undone.')) return;

    try {
      await teamService.deleteTeam(teamId);
      toast.success('Team deleted');
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
      await loadTeams();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete team');
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return colors[role?.toLowerCase()] || colors.member;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage teams, add members, and assign roles
          </p>
        </div>
        <Button onClick={() => setShowNewTeamModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Team
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <Card
            key={team.id}
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedTeam(team);
              setExpandedTeamId(expandedTeamId === team.id ? null : team.id);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{team.name}</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {team.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {team.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  <p className="text-lg font-bold text-blue-600">{team.memberCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeam(team);
                    setShowAddMemberModal(true);
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add Member
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Details Sidebar */}
      {selectedTeam && (
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle className="text-2xl">{selectedTeam.name}</CardTitle>
              {selectedTeam.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {selectedTeam.description}
                </p>
              )}
            </div>
            {selectedTeam.lead_name && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Team Lead</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedTeam.lead_name}</p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Members List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members ({selectedTeam.members.length})
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddMemberModal(true)}
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>

              {selectedTeam.members.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No members in this team yet
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                            member.team_role
                          )}`}
                        >
                          {member.team_role}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedTeam.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedTeam.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No teams found matching your search' : 'No teams yet'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* New Team Modal */}
      {showNewTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Create New Team</CardTitle>
            </CardHeader>
            <CardContent className="bg-white dark:bg-white">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={newTeamData.name}
                    onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                    placeholder="e.g., Frontend Team"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTeamData.description}
                    onChange={(e) =>
                      setNewTeamData({ ...newTeamData, description: e.target.value })
                    }
                    placeholder="Optional team description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    Create Team
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowNewTeamModal(false);
                      setNewTeamData({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Add Member to {selectedTeam.name}</CardTitle>
            </CardHeader>
            <CardContent className="bg-white dark:bg-white">
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Select User *
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {allUsers
                      .filter((u) => !selectedTeam.members.find((m) => m.id === u.id))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Role *
                  </label>
                  <select
                    value={selectedMemberRole}
                    onChange={(e) => setSelectedMemberRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    Add Member
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setSelectedUserId('');
                      setSelectedMemberRole('member');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
