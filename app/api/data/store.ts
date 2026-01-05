
export interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  tenant_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const tenants: Tenant[] = [];
export const users: User[] = [];
export const teams: Team[] = [];
export const teamMembers: TeamMember[] = [];
export const messages: Message[] = [];

export function generateId(): string {
  return crypto.randomUUID();
}
