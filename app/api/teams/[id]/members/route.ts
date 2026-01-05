import { NextRequest, NextResponse } from 'next/server';
import { teams, users, teamMembers, generateId } from '../../../data/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;

  const members = teamMembers
    .filter(tm => tm.team_id === teamId)
    .map(tm => ({
      ...tm,
      user: users.find(u => u.id === tm.user_id)
    }));

  return NextResponse.json(members);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;
  const body = await request.json();
  const { user_id } = body;

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // Verify team exists
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  // Verify user exists
  const user = users.find(u => u.id === user_id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify user belongs to the same tenant as the team
  if (user.tenant_id !== team.tenant_id) {
    return NextResponse.json(
      { error: 'User must belong to the same tenant as the team' },
      { status: 403 }
    );
  }

  // Check if already a member
  const existingMember = teamMembers.find(
    tm => tm.team_id === teamId && tm.user_id === user_id
  );
  if (existingMember) {
    return NextResponse.json(
      { error: 'User is already a member of this team' },
      { status: 400 }
    );
  }

  const member = {
    id: generateId(),
    team_id: teamId,
    user_id,
    created_at: new Date().toISOString()
  };

  teamMembers.push(member);
  return NextResponse.json(member, { status: 201 });
}
