'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Protected from '../../../components/Protected';
import IssueForm from '../../../components/IssueForm';
import { useAuth } from '../../../components/AuthProvider';
import { supabase, STATUSES } from '../../../lib/supabase';

function Detail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [i, c] = await Promise.all([
      supabase.from('issues')
        .select('*,assignee:profiles!issues_assigned_to_fkey(full_name,email),author:profiles!issues_created_by_fkey(full_name,email)')
        .eq('id', id).single(),
      supabase.from('comments').select('*,author:profiles(full_name,email)').eq('issue_id', id).order('created_at'),
    ]);
    if (i.error) setError('Issue not found.'); else setIssue(i.data);
    setComments(c.data || []);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (error) return <p className="error">{error}</p>;
  if (!issue) return <p className="muted">Loading…</p>;

  const canEdit = isAdmin || issue.created_by === user.id || issue.assigned_to === user.id;
  const canDelete = isAdmin || issue.created_by === user.id;
  const name = (p) => (p ? p.full_name || p.email : 'Unassigned');

  async function save(values) {
    const { error } = await supabase.from('issues').update({ ...values, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return error;
    setEditing(false); load();
  }
  async function remove() {
    if (!confirm('Delete this issue and its comments?')) return;
    const { error } = await supabase.from('issues').delete().eq('id', id);
    if (error) setError(error.message); else router.push('/issues');
  }
  async function addComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const { error } = await supabase.from('comments').insert({ issue_id: id, user_id: user.id, body: text.trim() });
    if (error) return setError(error.message);
    setText(''); load();
  }
  async function delComment(cid) { await supabase.from('comments').delete().eq('id', cid); load(); }

  if (editing) return (<><h1>Edit issue</h1><IssueForm initial={issue} submitLabel="Save changes" onSubmit={save} onCancel={() => setEditing(false)} /></>);

  return (
    <>
      <h1>{issue.title}</h1>
      <div className="panel">
        <p><span className={`badge ${issue.status.replace(' ', '-')}`}>{issue.status}</span>{' '}
          <span className="muted">Assigned to {name(issue.assignee)} · created by {name(issue.author)} on {new Date(issue.created_at).toLocaleString()}</span></p>
        <pre>{issue.description || 'No description.'}</pre>
        <div className="row" style={{ marginTop: 16 }}>
          {canEdit && <select style={{ width: 160 }} value={issue.status} onChange={(e) => save({ status: e.target.value })}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}
          {canEdit && <button className="ghost" onClick={() => setEditing(true)}>Edit issue</button>}
          {canDelete && <button className="danger" onClick={remove}>Delete issue</button>}
        </div>
      </div>
      <h2>Comments ({comments.length})</h2>
      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <small>{name(c.author)} on {new Date(c.created_at).toLocaleString()}</small>
          <pre>{c.body}</pre>
          {(isAdmin || c.user_id === user.id) && <button className="ghost" onClick={() => delComment(c.id)}>Delete comment</button>}
        </div>
      ))}
      <form className="form" onSubmit={addComment} style={{ marginTop: 16 }}>
        <textarea rows={3} placeholder="Write a comment" value={text} onChange={(e) => setText(e.target.value)} />
        <div><button>Add comment</button></div>
      </form>
    </>
  );
}
export default function Page() { return <Protected><Detail /></Protected>; }
