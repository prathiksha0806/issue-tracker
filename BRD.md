# Business Requirements Document: Issue Tracker

## 1. Purpose
Give small teams one place to report problems, assign them to people, track progress and discuss them.

## 2. Scope
In scope: authentication, issue management, assignment, status tracking, comments, dashboard, admin controls. Out of scope: email notifications, file attachments, issue priorities/labels.

## 3. User roles
| Role | Capabilities |
|---|---|
| User | Register, log in, create issues, edit issues they created or are assigned to, delete their own issues, comment, view dashboard |
| Admin | Everything a user can do, plus edit/delete any issue or comment and promote/demote users |

## 4. Functional requirements
| ID | Requirement |
|---|---|
| FR1 | Users can register and log in with email and password |
| FR2 | Admins log in through the same page; the role is stored on the profile |
| FR3 | Users can create, edit and delete issues (title, description, status, assignee) |
| FR4 | An issue can be assigned to any registered user |
| FR5 | Status is one of Open, In Progress, Closed |
| FR6 | Logged-in users can add comments to an issue; authors and admins can delete them |
| FR7 | Dashboard shows total issues, count per status, and issues assigned to the current user |
| FR8 | Issue list supports search by title and filtering by status or assignee |

## 5. Non-functional requirements
- **Security:** passwords handled by Supabase Auth; Row Level Security enforces permissions in the database; only the public anon key is used in the browser.
- **Usability:** responsive layout, keyboard-focusable controls, clear error messages.
- **Performance:** pages load in under 3 seconds for up to a few thousand issues.
- **Maintainability:** no custom server; schema in one SQL file.

## 6. Deployment
**Hosting:** Frontend on Vercel (https://issue-tracker-virid-eight.vercel.app). Auth and database on Supabase (free tier).

**Approach:** The GitHub repository is connected to Vercel. Every push to `main` builds and deploys automatically. The database is created once from `supabase/schema.sql`.

**Required services:** GitHub (source), Vercel (hosting), Supabase (Auth + PostgreSQL).

**Steps to deploy**
1. Create a Supabase project; run `supabase/schema.sql` in the SQL Editor.
2. Disable "Confirm email" under Authentication > Providers > Email (optional, for easy testing).
3. Push the code to GitHub.
4. Import the repo in Vercel; add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; click Deploy.
5. Set Supabase Site URL to the Vercel URL.
6. Register the first account, then promote it: `update profiles set role = 'admin' where email = '<email>';`

**Steps to update:** commit and push to `main`; Vercel redeploys. Schema changes are run manually in the Supabase SQL Editor. If environment variables change, update them in Vercel and redeploy.

## 7. Acceptance criteria
A user can register, log in, create an issue, assign it, change its status and comment; an admin can delete any issue; dashboard counts match the data.
