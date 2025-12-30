import { useState, useEffect } from 'react';
// useNavigate intentionally omitted (unused)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, UserPlus, Frown, UserCheck, UserX, MoreVertical, Mail, Phone, Briefcase, Calendar, Filter } from 'lucide-react';
import { teamService, Team, TeamMember } from '@/services/teamService';
import { userService, User } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

interface TeamWithMembers extends Team {
  members: TeamMember[];
  memberCount: number;
}

export default function TeamResources() {
  // navigate intentionally omitted (unused)
  const { toast } = useToast();
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [newTeamData, setNewTeamData] = useState({ name: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState('member');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTeams(), loadUsers()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: 'Failed to load teams',
        variant: 'destructive',
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      setAllUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await teamService.createTeam(newTeamData);
      toast({
        title: 'Success',
        description: 'Team created successfully',
      });
      setNewTeamData({ name: '', description: '' });
      setShowNewTeamModal(false);
      await loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    try {
      await teamService.addTeamMember(selectedTeam.id, selectedUserId, selectedMemberRole);
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
      setSelectedUserId('');
      setSelectedMemberRole('member');
      setShowAddMemberModal(false);
      await loadTeams();
      // Refresh selected team
      const updated = teams.find((t) => t.id === selectedTeam.id);
      if (updated) setSelectedTeam(updated);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam || !window.confirm('Remove this member from the team?')) return;

    try {
      await teamService.removeTeamMember(selectedTeam.id, memberId);
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      await loadTeams();
      const updated = teams.find((t) => t.id === selectedTeam.id);
      if (updated) setSelectedTeam(updated);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Delete this team? This action cannot be undone.')) return;

    try {
      await teamService.deleteTeam(teamId);
      toast({
        title: 'Success',
        description: 'Team deleted successfully',
      });
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
      await loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete team',
        variant: 'destructive',
      });
    }
  };

  // Filter teams based on search and active tab
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && team.status === activeTab.toUpperCase();
  });

  // Get unique roles for filter
  const allRoles = Array.from(new Set(allUsers.flatMap(user => user.roles || [])));

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    const roleMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success'> = {
      admin: 'destructive',
      manager: 'default',
      lead: 'secondary',
      member: 'outline',
    };
    return roleMap[role.toLowerCase()] || 'outline';
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success'> = {
      active: 'default',
      inactive: 'outline',
      archived: 'secondary',
    };
    return statusMap[status.toLowerCase()] || 'outline';
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Resources</h1>
          <p className="text-muted-foreground">
            Manage your teams and members in one place
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={() => setShowNewTeamModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Team
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams or members..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <span className="text-muted-foreground">Status: </span>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <span className="text-muted-foreground">Role: </span>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {allRoles.map((role) => (
                <SelectItem key={role} value={role.toLowerCase()}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> All Teams
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" /> Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <UserX className="h-4 w-4" /> Inactive
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
              <Frown className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No teams found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? 'Try a different search term' : 'Create a new team to get started'}
              </p>
              <Button onClick={() => setShowNewTeamModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <Card 
                  key={team.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedTeam?.id === team.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {team.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusBadgeVariant(team.status || 'active')}>
                        {team.status || 'Active'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{team.memberCount} members</span>
                      </div>
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((member) => (
                          <Avatar key={member.userId} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {getUserInitials(member.name || '')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.memberCount > 3 && (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                            +{team.memberCount - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Updated {new Date(team.updatedAt || team.createdAt || '').toLocaleDateString()}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Team</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTeam(team.id)}>
                          Delete Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Team Details Sidebar */}
      {selectedTeam && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l z-50 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTeam(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm">{selectedTeam.description || 'No description provided'}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedTeam.members.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No members in this team yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTeam.members.map((member) => (
                        <TableRow key={member.userId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>
                                  {getUserInitials(member.name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{member.name}</div>
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(member.role || 'member')}>
                              {member.role || 'Member'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleRemoveMember(member.userId)}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Team Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>TK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Team Member</span>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm">Updated project status to <span className="font-medium">In Progress</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Team Modal */}
      {showNewTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Team</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNewTeamModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </Button>
            </div>
            
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label htmlFor="team-name" className="block text-sm font-medium mb-1">
                  Team Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="team-name"
                  placeholder="e.g., Design Team, Engineering, etc."
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="team-description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="team-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                  placeholder="A brief description of the team's purpose..."
                  rows={3}
                  value={newTeamData.description}
                  onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTeamModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Team</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Team Member</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAddMemberModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </Button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label htmlFor="select-user" className="block text-sm font-medium mb-1">
                  Select User <span className="text-destructive">*</span>
                </label>
                <Select 
                  value={selectedUserId} 
                  onValueChange={setSelectedUserId}
                  required
                >
                  <SelectTrigger id="select-user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers
                      .filter(user => !selectedTeam.members.some(m => m.userId === user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {getUserInitials(user.name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                            <Badge variant="outline" className="ml-auto">
                              {user.roles?.[0] || 'User'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="select-role" className="block text-sm font-medium mb-1">
                  Role <span className="text-destructive">*</span>
                </label>
                <Select 
                  value={selectedMemberRole} 
                  onValueChange={setSelectedMemberRole}
                  required
                >
                  <SelectTrigger id="select-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="lead">Team Lead</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddMemberModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add to Team</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
