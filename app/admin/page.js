'use client';
import { useEffect, useState } from 'react';
import Protected from '../../components/Protected';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabase';

function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const load = () => supabase.from('profiles').select('*').order('email').then(({ data }) => setUsers(data || []));
  useEffect(() => { load(); }, []);
  async function setRole(id, role) { await supabase.from('profiles').update({ role }).eq('id', id); load(); }
  return (
    <>
      <h1>Users</h1>
      <div className="scroll"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td>
            <td><select value={u.role} disabled={u.id === user.id} onChange={(e) => setRole(u.id, e.target.value)}>
              <option value="user">User</option><option value="admin">Admin</option></select></td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
export default function Page() { return <Protected adminOnly><Users /></Protected>; }
