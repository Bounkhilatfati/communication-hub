import { NextRequest, NextResponse } from 'next/server';
import { teams, tenants, generateId } from '../data/store';

export async function GET() {
  const teamsWithTenants = teams.map(team => ({
    ...team,
    tenant: tenants.find(t => t.id === team.tenant_id)
  }));
  return NextResponse.json(teamsWithTenants);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, tenant_id } = body;

  if (!name || !tenant_id) {
    return NextResponse.json(
      { error: 'Name and tenant_id are required' },
      { status: 400 }
    );
  }
  
  const tenant = tenants.find(t => t.id === tenant_id);
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const team = {
    id: generateId(),
    name,
    tenant_id,
    created_at: new Date().toISOString()
  };

  teams.push(team);
  return NextResponse.json(team, { status: 201 });
}
