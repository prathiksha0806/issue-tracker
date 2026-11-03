# Issue Tracker

A web app to create, assign, discuss and track issues. Users register and log in; admins manage everything.

**Live URL:** https://YOUR-APP.vercel.app  *(replace after deploying)*
**Repository:** https://github.com/YOUR-USERNAME/issue-tracker
**Demo admin:** admin@example.com / YourPassword *(replace with the account you create)*

## Features
- User registration and login (Supabase Auth, email + password)
- Admin role: edit or delete any issue/comment, promote users on the **Users** page
- Create, edit, delete issues
- Assign an issue to any registered user
- Status tracking: Open, In Progress, Closed
- Comments on each issue
- Dashboard with counts (total, per status, assigned to me)
- Issue list with search and filters

## Architecture
```
Browser (Next.js 14 App Router, React, client-side pages)
        |  supabase-js (HTTPS, user JWT)
        v
Supabase: Auth + PostgreSQL with Row Level Security (RLS)
```
There is no custom backend server. All security rules live in the database as RLS policies (`supabase/schema.sql`), so the browser can only do what the logged-in user's role allows. Hosting: Vercel (frontend), Supabase (auth + database).

## Tech stack
Next.js 14, React 18, JavaScript, plain CSS, Supabase (Auth + Postgres), Vercel.

## Setup (local)
1. Clone the repo and run `npm install`.
2. Create a free project at https://supabase.com.
3. In Supabase open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
4. In Supabase go to **Authentication > Providers > Email** and turn off **Confirm email** (so sign-up logs in instantly).
5. Copy `.env.example` to `.env.local` and fill in the values (see below).
6. Run `npm run dev` and open http://localhost:3000.
7. Register an account, then make it admin in the SQL Editor:
   `update profiles set role = 'admin' where email = 'admin@example.com';`

## Environment variables
| Name | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key (same page). Safe to expose; RLS protects data. |

## Data model
- `profiles` (id, email, full_name, role `user|admin`), created automatically on sign-up
- `issues` (id, title, description, status, created_by, assigned_to, created_at, updated_at)
- `comments` (id, issue_id, user_id, body, created_at)

## API details
The app calls Supabase through `supabase-js`; these are the operations used.

| Action | Operation | Who may do it |
|---|---|---|
| Register | `auth.signUp` | anyone |
| Login / logout | `auth.signInWithPassword` / `auth.signOut` | anyone |
| List/read issues, comments, users | `select` on `issues`, `comments`, `profiles` | any logged-in user |
| Create issue | `insert` into `issues` | any logged-in user (as themselves) |
| Edit issue / change status / assign | `update` on `issues` | creator, assignee, admin |
| Delete issue | `delete` on `issues` | creator, admin |
| Add comment | `insert` into `comments` | any logged-in user |
| Delete comment | `delete` on `comments` | author, admin |
| Change user role | `update` on `profiles` | admin |

## Deployment (Vercel)
1. Push the repo to GitHub.
2. On https://vercel.com choose **Add New > Project** and import the repo (framework auto-detected as Next.js).
3. Add the two environment variables above, then click **Deploy**.
4. In Supabase **Authentication > URL Configuration**, set Site URL to your Vercel URL.
5. Updates: push to `main`; Vercel redeploys automatically.
