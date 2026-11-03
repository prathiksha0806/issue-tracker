'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function Nav() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();
  if (!user) return null;
  return (
    <header className="nav">
      <strong className="brand">Issue Tracker</strong>
      <nav>
        <Link href="/">Dashboard</Link>
        <Link href="/issues">Issues</Link>
        <Link href="/issues/new">New issue</Link>
        {isAdmin && <Link href="/admin">Users</Link>}
      </nav>
      <div className="who">
        <span>{profile?.full_name || user.email}</span>
        <span className={`badge ${isAdmin ? 'admin' : ''}`}>{isAdmin ? 'Admin' : 'User'}</span>
        <button className="ghost" onClick={async () => { await signOut(); router.replace('/login'); }}>Log out</button>
      </div>
    </header>
  );
}
