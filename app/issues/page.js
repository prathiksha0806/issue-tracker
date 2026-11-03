'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Protected from '../../components/Protected';
import { useAuth } from '../../components/AuthProvider';
import { supabase, STATUSES } from '../../lib/supabase';

function List() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    supabase.from('issues')
      .select('id,title,status,created_at,assigned_to,assignee:profiles!issues_assigned_to_fkey(full_name,email),author:profiles!issues_created_by_fkey(full_name,email)')
      .order('created_at', { ascending: false }).then(({ data }) => setIssues(data || []));
  }, []);

  const shown = issues.filter((i) =>
    i.title.toLowerCase().includes(q.toLowerCase()) && (!status || i.status === status) && (!onlyMine || i.assigned_to === user.id));
  const name = (p) => (p ? p.full_name || p.email : '—');

  return (
    <>
      <h1>Issues</h1>
      <div className="toolbar">
        <input placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={onlyMine ? 'mine' : ''} onChange={(e) => setOnlyMine(e.target.value === 'mine')}>
          <option value="">Everyone's issues</option><option value="mine">Assigned to me</option>
        </select>
      </div>
      <div className="scroll"><table>
        <thead><tr><th>Title</th><th>Status</th><th>Assignee</th><th>Created by</th><th>Created</th></tr></thead>
        <tbody>
          {shown.map((i) => (
            <tr key={i.id}>
              <td><Link href={`/issues/${i.id}`}>{i.title}</Link></td>
              <td><span className={`badge ${i.status.replace(' ', '-')}`}>{i.status}</span></td>
              <td>{name(i.assignee)}</td><td>{name(i.author)}</td>
              <td>{new Date(i.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {shown.length === 0 && <tr><td colSpan={5} className="muted">No issues match.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
export default function Page() { return <Protected><List /></Protected>; }
