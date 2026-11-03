'use client';
import { useEffect, useState } from 'react';
import { supabase, STATUSES } from '../lib/supabase';

export default function IssueForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'Open', assigned_to: '', ...initial });
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, email').order('full_name').then(({ data }) => setUsers(data || []));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const err = await onSubmit({
      title: form.title.trim(), description: form.description,
      status: form.status, assigned_to: form.assigned_to || null,
    });
    if (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <label>Title<input required value={form.title} onChange={set('title')} /></label>
      <label>Description<textarea rows={5} value={form.description || ''} onChange={set('description')} /></label>
      <div className="row">
        <label>Status
          <select value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label>Assign to
          <select value={form.assigned_to || ''} onChange={set('assigned_to')}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
        {onCancel && <button type="button" className="ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
