'use client';

import { useState, useEffect } from 'react';

interface Tenant {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
  tenant?: Tenant;
}

interface Team {
  id: string;
  name: string;
  tenant_id: string;
  tenant?: Tenant;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  team_id: string;
  created_at: string;
  user?: User;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'setup' | 'teams' | 'messages'>('setup');
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [newTenantName, setNewTenantName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedTenantForUser, setSelectedTenantForUser] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTenantForTeam, setSelectedTenantForTeam] = useState('');
  const [selectedTeamForMember, setSelectedTeamForMember] = useState('');
  const [selectedUserForMember, setSelectedUserForMember] = useState('');
  const [selectedTeamForMessages, setSelectedTeamForMessages] = useState('');
  const [selectedUserForMessages, setSelectedUserForMessages] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [tenantsRes, usersRes, teamsRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/users'),
        fetch('/api/teams')
      ]);
      setTenants(await tenantsRes.json());
      setUsers(await usersRes.json());
      setTeams(await teamsRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (msg: string, isError: boolean) => {
    if (isError) {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  const createTenant = async () => {
    if (!newTenantName.trim()) return;
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTenantName })
      });
      if (res.ok) {
        setNewTenantName('');
        fetchData();
        showMessage('Tenant created successfully!', false);
      }
    } catch (err) {
      showMessage('Failed to create tenant', true);
    }
  };

  const createUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !selectedTenantForUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          tenant_id: selectedTenantForUser
        })
      });
      if (res.ok) {
        setNewUserName('');
        setNewUserEmail('');
        setSelectedTenantForUser('');
        fetchData();
        showMessage('User created successfully!', false);
      }
    } catch (err) {
      showMessage('Failed to create user', true);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || !selectedTenantForTeam) return;
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName,
          tenant_id: selectedTenantForTeam
        })
      });
      if (res.ok) {
        setNewTeamName('');
        setSelectedTenantForTeam('');
        fetchData();
        showMessage('Team created successfully!', false);
      }
    } catch (err) {
      showMessage('Failed to create team', true);
    }
  };

  const addTeamMember = async () => {
    if (!selectedTeamForMember || !selectedUserForMember) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeamForMember}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserForMember })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTeamForMember('');
        setSelectedUserForMember('');
        showMessage('Member added successfully!', false);
      } else {
        showMessage(data.error || 'Failed to add member', true);
      }
    } catch (err) {
      showMessage('Failed to add member', true);
    }
  };

  const fetchMessages = async () => {
    if (!selectedTeamForMessages || !selectedUserForMessages) return;
    try {
      const res = await fetch(
        `/api/teams/${selectedTeamForMessages}/messages?user_id=${selectedUserForMessages}`
      );
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
        setError('');
      } else {
        setMessages([]);
        showMessage(data.error || 'Access denied', true);
      }
    } catch (err) {
      showMessage('Failed to fetch messages', true);
    }
  };

  const sendMessage = async () => {
    if (!selectedTeamForMessages || !selectedUserForMessages || !newMessageContent.trim()) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeamForMessages}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserForMessages,
          content: newMessageContent
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewMessageContent('');
        fetchMessages();
        showMessage('Message sent!', false);
      } else {
        showMessage(data.error || 'Failed to send message', true);
      }
    } catch (err) {
      showMessage('Failed to send message', true);
    }
  };

  useEffect(() => {
    if (selectedTeamForMessages && selectedUserForMessages) {
      fetchMessages();
    }
  }, [selectedTeamForMessages, selectedUserForMessages]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white' }}>
      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
            Communication Hub & Team Management
          </h1>

          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', color: '#86EFAC', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['setup', 'teams', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  textTransform: 'capitalize',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab ? '#2563EB' : '#374151',
                  color: activeTab === tab ? 'white' : '#D1D5DB'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Create Tenant</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="Tenant name"
                    style={{ flex: 1, padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  />
                  <button
                    onClick={createTenant}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                  >
                    Create
                  </button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Existing: {tenants.map(t => t.name).join(', ') || 'None'}
                </div>
              </div>

              <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Create User</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="User name"
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Email"
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  />
                  <select
                    value={selectedTenantForUser}
                    onChange={(e) => setSelectedTenantForUser(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  >
                    <option value="">Select tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={createUser}
                    style={{ width: '100%', padding: '0.5rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                  >
                    Create User
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Create Team</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Team name"
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  />
                  <select
                    value={selectedTenantForTeam}
                    onChange={(e) => setSelectedTenantForTeam(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  >
                    <option value="">Select tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={createTeam}
                    style={{ width: '100%', padding: '0.5rem 1rem', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                  >
                    Create Team
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Add Team Member</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <select
                    value={selectedTeamForMember}
                    onChange={(e) => setSelectedTeamForMember(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  >
                    <option value="">Select team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.tenant?.name})
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedUserForMember}
                    onChange={(e) => setSelectedUserForMember(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.tenant?.name})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addTeamMember}
                    style={{ width: '100%', padding: '0.5rem 1rem', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                  >
                    Add Member
                  </button>
                </div>
              </div>

              
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Select Team & User</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <select
                    value={selectedTeamForMessages}
                    onChange={(e) => setSelectedTeamForMessages(e.target.value)}
                    style={{ padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  >
                    <option value="">Select team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.tenant?.name})
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedUserForMessages}
                    onChange={(e) => setSelectedUserForMessages(e.target.value)}
                    style={{ padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.tenant?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTeamForMessages && selectedUserForMessages && (
                <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Messages</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '24rem', overflowY: 'auto' }}>
                    {messages.map(message => (
                      <div key={message.id} style={{ backgroundColor: '#374151', padding: '0.75rem', borderRadius: '0.375rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500', color: '#93C5FD' }}>
                            {message.user?.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: '#E5E7EB' }}>{message.content}</div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem' }}>No messages yet</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      style={{ flex: 1, padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: '1px solid #4B5563', borderRadius: '0.375rem', outline: 'none' }}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      style={{ padding: '0.5rem 1.5rem', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}