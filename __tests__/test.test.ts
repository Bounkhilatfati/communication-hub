import { canUserAccessTeam, sendMessage } from '../app/api/data/access-control';
import { 
  tenants, 
  users, 
  teams, 
  teamMembers, 
  messages
} from '../app/api/data/store';

let idCounter = 0;
const generateTestId = () => `test-id-${++idCounter}`;

beforeEach(() => {
  tenants.length = 0;
  users.length = 0;
  teams.length = 0;
  teamMembers.length = 0;
  messages.length = 0;
  idCounter = 0;
});

describe('Required Tests', () => {
  test('verifying team access control', () => {
    const tenant = { id: generateTestId(), name: 'Company A', created_at: new Date().toISOString() };
    tenants.push(tenant);
    const user = { id: generateTestId(), name: 'User1', email: 'User1@company.com', tenant_id: tenant.id, created_at: new Date().toISOString() };
    users.push(user);
    const team = { id: generateTestId(), name: 'Dev Team', tenant_id: tenant.id, created_at: new Date().toISOString() };
    teams.push(team);
    expect(canUserAccessTeam(user.id, team.id)).toBe(false);
    teamMembers.push({ id: generateTestId(), team_id: team.id, user_id: user.id, created_at: new Date().toISOString() });
    expect(canUserAccessTeam(user.id, team.id)).toBe(true);
  });

  test('preventing non-members from sending messages', () => {
    const tenant = { id: generateTestId(), name: 'Company A', created_at: new Date().toISOString() };
    tenants.push(tenant);
    const member = { id: generateTestId(), name: 'User1', email: 'User1@company.com', tenant_id: tenant.id, created_at: new Date().toISOString() };
    const nonMember = { id: generateTestId(), name: 'User2', email: 'User2 @company.com', tenant_id: tenant.id, created_at: new Date().toISOString() };
    users.push(member, nonMember);
    const team = { id: generateTestId(), name: 'Dev Team', tenant_id: tenant.id, created_at: new Date().toISOString() };
    teams.push(team);
    teamMembers.push({ id: generateTestId(), team_id: team.id, user_id: member.id, created_at: new Date().toISOString() });
    const memberResult = sendMessage(team.id, member.id, 'Hello team!');
    expect(memberResult.success).toBe(true);
    const nonMemberResult = sendMessage(team.id, nonMember.id, 'Unauthorized message');
    expect(nonMemberResult.success).toBe(false);
    expect(nonMemberResult.error).toBe('Access denied: User cannot access this team');
  });

  test('ensuring tenant isolation', () => {
    const tenant1 = { id: generateTestId(), name: 'Company A', created_at: new Date().toISOString() };
    const tenant2 = { id: generateTestId(), name: 'Company B', created_at: new Date().toISOString() };
    tenants.push(tenant1, tenant2);
    const user1 = { id: generateTestId(), name: 'User1', email: 'User1@companya.com', tenant_id: tenant1.id, created_at: new Date().toISOString() };
    const user2 = { id: generateTestId(), name: 'User2', email: 'User2@companyb.com', tenant_id: tenant2.id, created_at: new Date().toISOString() };
    users.push(user1, user2);

    // Create teams in different tenants
    const team1 = { id: generateTestId(), name: 'Team A', tenant_id: tenant1.id, created_at: new Date().toISOString() };
    const team2 = { id: generateTestId(), name: 'Team B', tenant_id: tenant2.id, created_at: new Date().toISOString() };
    teams.push(team1, team2);
    teamMembers.push(
      { id: generateTestId(), team_id: team1.id, user_id: user1.id, created_at: new Date().toISOString() },
      { id: generateTestId(), team_id: team2.id, user_id: user2.id, created_at: new Date().toISOString() }
    );
    expect(canUserAccessTeam(user1.id, team2.id)).toBe(false);
    expect(canUserAccessTeam(user2.id, team1.id)).toBe(false);
    const crossTenantResult1 = sendMessage(team2.id, user1.id, 'Cross-tenant message');
    const crossTenantResult2 = sendMessage(team1.id, user2.id, 'Cross-tenant message');
    expect(crossTenantResult1.success).toBe(false);
    expect(crossTenantResult2.success).toBe(false);
  });
});