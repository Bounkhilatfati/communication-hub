import { users, teams, teamMembers, messages, generateId, Message } from './store';

/**
 * Rule: User must belong to the same tenant as the team AND be a member of the team
 */
export function canUserAccessTeam(userId: string, teamId: string): boolean {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  const team = teams.find(t => t.id === teamId);
  if (!team) return false;
  if (user.tenant_id !== team.tenant_id) return false;
  const isMember = teamMembers.some(
    tm => tm.team_id === teamId && tm.user_id === userId
  );

  return isMember;
}

/**
 * Send a message to a team
 * Only allowed if canUserAccessTeam returns true
 */
export function sendMessage(
  teamId: string,
  userId: string,
  content: string
): { success: boolean; message?: Message; error?: string } {
  if (!canUserAccessTeam(userId, teamId)) {
    return {
      success: false,
      error: 'Access denied: User cannot access this team'
    };
  }
  const newMessage: Message = {
    id: generateId(),
    team_id: teamId,
    user_id: userId,
    content,
    created_at: new Date().toISOString()
  };

  messages.push(newMessage);

  return { success: true, message: newMessage };
}
