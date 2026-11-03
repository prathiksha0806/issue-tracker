-- Run this whole file in Supabase > SQL Editor
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user','admin'))
);
create table issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  status text not null default 'Open' check (status in ('Open','In Progress','Closed')),
  created_by uuid not null references profiles(id) on delete cascade,
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Auto-create a profile when someone registers
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table profiles enable row level security;
alter table issues enable row level security;
alter table comments enable row level security;

create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles admin update" on profiles for update to authenticated using (is_admin());

create policy "issues read" on issues for select to authenticated using (true);
create policy "issues insert" on issues for insert to authenticated with check (created_by = auth.uid());
create policy "issues update" on issues for update to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid() or is_admin());
create policy "issues delete" on issues for delete to authenticated using (created_by = auth.uid() or is_admin());

create policy "comments read" on comments for select to authenticated using (true);
create policy "comments insert" on comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments delete" on comments for delete to authenticated using (user_id = auth.uid() or is_admin());

-- After registering your admin account in the app, run:
-- update profiles set role = 'admin' where email = 'admin@example.com';
   -- Permissions for logged-in users (needed on newer Supabase projects)
   grant usage on schema public to authenticated;
   grant select, insert, update, delete on all tables in schema public to authenticated;