# Communication Hub & Team Management

Multi-tenant team messaging system with access control.

## Requirements

- Node.js >= 18
- npm

## Installation & Setup

1. Clone project:
```bash
git clone https://github.com/Bounkhilatfati/communication-hub.git
cd communication-hub
```
2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Testing

Run tests:
```bash
npm test
```

## Backend Access Control Rules

### Core Functions

#### `canUserAccessTeam(userId: string, teamId: string): boolean`
- **Rule**: User must belong to the same tenant as the team and be a member of the team

#### `sendMessage(teamId: string, userId: string, content: string)`
- **Rule**: Only team members can send messages

### Tests Implemented

1. **Team Access Control Verification**
   - User has no access before being team member
   - User gains access after being added to team

2. **Non Member Message Prevention**
   - Only team members can view team messages
   - Only team members can send messages
   - Non members are denied access

3. **Tenant Isolation Enforcement**
   - Users cannot access teams from other tenants
   - Cross tenant message sending blocked
 

## Usage

1. **Setup Tab**: Create tenants and users
2. **Teams Tab**: Create teams and add members  
3. **Messages Tab**: Select team/user to view and send messages

## Features

- Multi-tenant isolation
- Team-based access control
- In-memory data storage
- Backend security validation

## API Endpoints

- `POST /api/tenants` - Create tenant
- `POST /api/users` - Create user
- `POST /api/teams` - Create team
- `POST /api/teams/:id/members` - Add team member
- `GET /api/teams/:id/messages` - Get messages (with access control)
- `POST /api/teams/:id/messages` - Send message (with access control)
