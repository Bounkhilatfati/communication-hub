import { NextRequest, NextResponse } from 'next/server';
import { messages, users } from '../../../data/store';
import { canUserAccessTeam, sendMessage } from '../../../data/access-control';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // Check access using canUserAccessTeam function
  if (!canUserAccessTeam(userId, teamId)) {
    return NextResponse.json(
      { error: 'Access denied: User cannot access this team' },
      { status: 403 }
    );
  }

  const teamMessages = messages
    .filter(m => m.team_id === teamId)
    .map(m => ({
      ...m,
      user: users.find(u => u.id === m.user_id)
    }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return NextResponse.json(teamMessages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;
  const body = await request.json();
  const { user_id, content } = body;

  if (!user_id || !content) {
    return NextResponse.json(
      { error: 'user_id and content are required' },
      { status: 400 }
    );
  }

  const result = sendMessage(teamId, user_id, content);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json(result.message, { status: 201 });
}
