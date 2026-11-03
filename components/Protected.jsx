'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function Protected({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  if (loading || !user) return <p className="muted">Loading…</p>;
  if (adminOnly && !isAdmin) return <p className="error">Only admins can view this page.</p>;
  return children;
}
