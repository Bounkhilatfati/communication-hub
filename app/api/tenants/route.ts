import { NextRequest, NextResponse } from 'next/server';
import { tenants, generateId } from '../data/store';

export async function GET() {
  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const tenant = {
    id: generateId(),
    name,
    created_at: new Date().toISOString()
  };

  tenants.push(tenant);
  return NextResponse.json(tenant, { status: 201 });
}
