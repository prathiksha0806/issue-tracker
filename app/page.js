'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Protected from '../components/Protected';
import { useAuth } from '../components/AuthProvider';
import { supabase, STATUSES } from '../lib/supabase';

function Dashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  useEffect(() => {
    supabase.from('issues').select('id,title,status,assigned_to,created_at').order('created_at', { ascending: false })
      .then(({ data }) => setIssues(data || []));
  }, []);
  const count = (s) => issues.filter((i) => i.status === s).length;
  const mine = issues.filter((i) => i.assigned_to === user.id && i.status !== 'Closed').length;
  const cls = { Open: 'open', 'In Progress': 'prog', Closed: 'done' };
  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="panel stat"><strong>{issues.length}</strong><span>Total issues</span></div>
        {STATUSES.map((s) => <div key={s} className={`panel stat ${cls[s]}`}><strong>{count(s)}</strong><span>{s}</span></div>)}
        <div className="panel stat"><strong>{mine}</strong><span>Assigned to me (not closed)</span></div>
      </div>
      <h2>Latest issues</h2>
      {issues.length === 0 && <p className="muted">No issues yet. <Link href="/issues/new">Create the first one.</Link></p>}
      {issues.slice(0, 5).map((i) => (
        <p key={i.id}><span className={`badge ${i.status.replace(' ', '-')}`}>{i.status}</span> <Link href={`/issues/${i.id}`}>{i.title}</Link></p>
      ))}
    </>
  );
}
export default function Page() { return <Protected><Dashboard /></Protected>; }
