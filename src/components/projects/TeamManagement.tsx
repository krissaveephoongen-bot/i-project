import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Users, Mail, Phone, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  skills?: string[];
}

interface TeamManagementProps {
  projectId: string;
  teamMembers: TeamMember[];
  onTeamChange: (members: TeamMember[]) => void;
  isEditable?: boolean;
}

export function TeamManagement({
  projectId,
  teamMembers,
  onTeamChange,
  isEditable = true,
}: TeamManagementProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'developer',
  });
  const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch available users when name is typed
  const handleNameChange = async (value: string) => {
    setNewMember({ ...newMember, name: value });

    if (value.length > 2) {
      try {
        const response = await api.get(`/users?search=${value}`);
        if (response.data?.data) {
          setAvailableUsers(response.data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.warn('Failed to fetch users:', error);
      }
    }
  };

  const handleSelectUser = (user: any) => {
    setNewMember({
      ...newMember,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });
    setShowSuggestions(false);
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) {
      toast.error('Team member name is required');
      return;
    }

    try {
      // Add to project team via API
      const response = await api.post(`/projects/${projectId}/team`, {
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
      });

      if (response.data?.success || response.status === 201) {
        const addedMember = response.data.data || {
          id: Date.now().toString(),
          ...newMember,
        };
        onTeamChange([...teamMembers, addedMember]);
        setNewMember({ name: '', email: '', phone: '', role: 'developer' });
        setIsAddingMember(false);
        toast.success('Team member added');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm('Remove this team member?')) return;

    try {
      await api.delete(`/projects/${projectId}/team/${memberId}`, {
        data: { memberName }
      });
      onTeamChange(teamMembers.filter(m => m.id !== memberId));
      toast.success('Team member removed');
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Member Form */}
      {isAddingMember && isEditable && (
        <Card className="bg-green-50 dark:bg-green-900/20 p-4">
          <div className="space-y-3">
            <div className="relative">
              <label className="text-sm font-medium">Team Member Name *</label>
              <Input
                placeholder="Start typing to search..."
                value={newMember.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-1"
              />
              {/* User Suggestions Dropdown */}
              {showSuggestions && availableUsers.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <p className="font-medium text-sm">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-gray-500">{user.email}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="+1234567890"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Project Manager</option>
                <option value="qa">QA Engineer</option>
                <option value="analyst">Business Analyst</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddMember}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Add Member
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingMember(false);
                  setNewMember({ name: '', email: '', phone: '', role: 'developer' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Member Button */}
      {!isAddingMember && isEditable && (
        <Button
          variant="outline"
          onClick={() => setIsAddingMember(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Team Member
        </Button>
      )}

      {/* Team Members List */}
      {teamMembers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No team members yet.</p>
          {isEditable && <p className="text-sm">Add team members to get started.</p>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teamMembers.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {member.name}
                  </h3>

                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                        {member.email}
                      </a>
                    </div>
                  )}

                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.role && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="capitalize">{member.role}</span>
                    </div>
                  )}

                  {member.skills && member.skills.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isEditable && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
