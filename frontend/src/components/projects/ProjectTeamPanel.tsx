import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, Plus, UserX, Award } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
  isLead?: boolean;
}

interface ProjectTeamPanelProps {
  members: TeamMember[];
  maxDisplay?: number;
  onAddMember?: () => void;
  onRemoveMember?: (memberId: string) => void;
}

export function ProjectTeamPanel({
  members,
  maxDisplay = 6,
  onAddMember,
  onRemoveMember,
}: ProjectTeamPanelProps) {
  const displayMembers = members.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, members.length - maxDisplay);

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-red-100 text-red-700',
      'bg-pink-100 text-pink-700',
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Members</span>
          </span>
          <Badge variant="outline">{members.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.length === 0 ? (
          <div className="text-center py-6">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 mb-4">No team members assigned</p>
            {onAddMember && (
              <Button size="sm" onClick={onAddMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Team Members List */}
            <div className="space-y-3">
              {displayMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Avatar */}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium ${getAvatarColor(index)}`}>
                      {getInitials(member.name)}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        {member.isLead && (
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        {member.joinDate && (
                          <span className="text-xs text-gray-500">
                            Joined {new Date(member.joinDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {onRemoveMember && !member.isLead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-2"
                      onClick={() => onRemoveMember(member.id)}
                    >
                      <UserX className="h-4 w-4 text-gray-400 hover:text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Show more indicator */}
            {hiddenCount > 0 && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">
                  +{hiddenCount} more member{hiddenCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Add Member Button */}
            {onAddMember && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onAddMember}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            )}
          </>
        )}

        {/* Team Stats */}
        {members.length > 0 && (
          <div className="border-t pt-4 mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <p className="text-gray-600">Total Members</p>
              <p className="text-lg font-bold text-gray-900">{members.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Team Leads</p>
              <p className="text-lg font-bold text-gray-900">
                {members.filter((m) => m.isLead).length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
