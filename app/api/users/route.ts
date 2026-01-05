import { NextRequest, NextResponse } from 'next/server';
import { users, tenants, generateId } from '../data/store';

export async function GET() {
  const usersWithTenants = users.map(user => ({
    ...user,
    tenant: tenants.find(t => t.id === user.tenant_id)
  }));
  return NextResponse.json(usersWithTenants);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, tenant_id } = body;

  if (!name || !email || !tenant_id) {
    return NextResponse.json(
      { error: 'Name, email, and tenant_id are required' },
      { status: 400 }
    );
  }

  const tenant = tenants.find(t => t.id === tenant_id);
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const user = {
    id: generateId(),
    name,
    email,
    tenant_id,
    created_at: new Date().toISOString()
  };

  users.push(user);
  return NextResponse.json(user, { status: 201 });
}
