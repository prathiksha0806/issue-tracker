'use client';
import { useRouter } from 'next/navigation';
import Protected from '../../../components/Protected';
import IssueForm from '../../../components/IssueForm';
import { useAuth } from '../../../components/AuthProvider';
import { supabase } from '../../../lib/supabase';

function New() {
  const { user } = useAuth();
  const router = useRouter();
  async function create(values) {
    const { data, error } = await supabase.from('issues').insert({ ...values, created_by: user.id }).select('id').single();
    if (error) return error;
    router.push(`/issues/${data.id}`);
  }
  return (<><h1>New issue</h1><IssueForm submitLabel="Create issue" onSubmit={create} /></>);
}
export default function Page() { return <Protected><New /></Protected>; }
