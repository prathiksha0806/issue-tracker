'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { if (user) router.replace('/'); }, [user, router]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const { email, password, name } = form;
    const { data, error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === 'register' && !data.session) setMsg('Account created. Check your email to confirm, then log in.');
  }

  return (
    <div className="auth panel">
      <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      <form className="form" onSubmit={submit}>
        {mode === 'register' && <label>Full name<input required value={form.name} onChange={set('name')} /></label>}
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        {msg && <p className="error">{msg}</p>}
        <button disabled={busy}>{mode === 'login' ? 'Log in' : 'Register'}</button>
      </form>
      <p className="muted">
        {mode === 'login' ? 'New here? ' : 'Already registered? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMsg(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'Create an account' : 'Log in'}
        </a>
      </p>
      <p className="muted">Admins log in here too; the admin role is set on the account.</p>
    </div>
  );
}
