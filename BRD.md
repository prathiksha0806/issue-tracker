# Business Requirements Document (BRD): Issue Tracker System

| Item | Details |
|---|---|
| Project | Issue Tracker System |
| Author | Prathiksha Poojary |
| Date | 3 November 2026 |
| Version | 1.0 |
| Live application | https://issue-tracker-virid-eight.vercel.app |
| Source code | https://github.com/prathiksha0806/issue-tracker |

## 1. Purpose
Small teams often track problems in chat messages and spreadsheets, so issues get lost and nobody knows who owns what. This application gives a team one place to report issues, assign them to a person, track their status and discuss them.

## 2. Scope
**In scope:** user registration and login, admin role, issue create/edit/delete, assignment, status tracking, comments, dashboard counts, issue search and filters, user management by admin.

**Out of scope:** email notifications, file attachments, issue priorities or labels, multiple projects or teams, password reset by email.

## 3. User roles
| Role | Capabilities |
|---|---|
| User | Register and log in. Create issues. Edit issues they created or are assigned to. Delete issues they created. Comment. Delete their own comments. View the dashboard and all issues. |
| Admin | Everything a user can do, plus edit or delete any issue, delete any comment, and promote or demote users on the Users page. |

The first admin is created by registering normally and then setting the role in the database (see section 7).

## 4. Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| FR1 | A visitor can register with name, email and password, and log in with email and password. | High |
| FR2 | Admins log in through the same login page. The role is stored on the user's profile and shown as a badge. | High |
| FR3 | A logged-in user can create an issue with a title, description, status and optional assignee. | High |
| FR4 | A user can edit an issue they created or are assigned to. An admin can edit any issue. | High |
| FR5 | A user can delete an issue they created. An admin can delete any issue. Deleting an issue also deletes its comments. | High |
| FR6 | An issue can be assigned to any registered user, and reassigned or unassigned later. | High |
| FR7 | Status is one of Open, In Progress or Closed, and can be changed from the issue page. | High |
| FR8 | A logged-in user can add comments to an issue. Authors and admins can delete a comment. | High |
| FR9 | The dashboard shows total issues, the count for each status, the number of issues assigned to the current user that are not closed, and the five latest issues. | High |
| FR10 | The issue list shows title, status, assignee, creator and date, with search by title and filters by status and "assigned to me". | Medium |
| FR11 | An admin can view all users and change their role. An admin cannot change their own role. | Medium |
| FR12 | Pages that need a login redirect anonymous visitors to the login page. | High |

## 5. Non-functional requirements
| Area | Requirement |
|---|---|
| Security | Passwords are handled by Supabase Auth and never stored by the application. Row Level Security (RLS) in the database enforces the permissions in section 3, so they cannot be bypassed from the browser. Only the public (publishable/anon) key is used in the frontend. Secret keys are never committed. |
| Usability | Responsive layout for desktop and mobile. Visible keyboard focus. Clear error messages. |
| Performance | Pages load in under 3 seconds for up to a few thousand issues on a normal connection. |
| Availability | Depends on Vercel and Supabase free-tier availability. |
| Maintainability | No custom server. The whole database setup is one SQL file. Code is organised by page and shared components. |

## 6. System design summary
- **Frontend:** Next.js 14 (App Router) with React, client-side pages, plain CSS.
- **Backend:** Supabase (PostgreSQL database, Auth, Row Level Security). The browser talks to Supabase directly through `supabase-js`.
- **Hosting:** Vercel for the frontend, Supabase for auth and data.

**Data model**
| Table | Main columns |
|---|---|
| `profiles` | id (linked to the auth user), email, full_name, role (`user` or `admin`) |
| `issues` | id, title, description, status, created_by, assigned_to, created_at, updated_at |
| `comments` | id, issue_id, user_id, body, created_at |

A database trigger creates a `profiles` row automatically when someone registers.

## 7. Deployment

### 7.1 Where it is hosted
| Part | Service | Address |
|---|---|---|
| Frontend | Vercel (Hobby plan) | https://issue-tracker-virid-eight.vercel.app |
| Database and authentication | Supabase (Free plan) | Project URL set in the environment variable below |
| Source code | GitHub (public) | https://github.com/prathiksha0806/issue-tracker |

### 7.2 Deployment approach
The GitHub repository is connected to Vercel. Every push to the `main` branch triggers an automatic build and deployment to production. The database is created once by running `supabase/schema.sql` in the Supabase SQL Editor. There is no separate backend server to deploy.

### 7.3 Required services
GitHub (source control), Vercel (hosting and build), Supabase (database and authentication). All have free tiers.

### 7.4 Environment variables
| Name | Where to find the value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API > Project URL | Public value |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon key (shown as "publishable key" in newer dashboards) | Public value, protected by RLS |

Never use the `service_role` or secret key in these variables.

### 7.5 Steps to deploy from scratch
1. **Create the database.** Create a Supabase project. Open SQL Editor, paste the whole of `supabase/schema.sql`, and run it.
2. **Allow instant sign-up (for testing).** In Supabase go to Authentication > Sign In / Providers and turn off "Confirm email".
3. **Push the code.** Create a public GitHub repository and push the project to the `main` branch.
4. **Import into Vercel.** In Vercel choose Add New > Project, import the repository, and keep the Next.js preset.
5. **Add the environment variables.** Add the two variables from 7.4 by hand. Do not add the Vercel Supabase integration, because it creates a separate empty database and adds conflicting variables.
6. **Deploy.** Click Deploy and wait for the status to show Ready.
7. **Configure Supabase URLs.** In Supabase go to Authentication > URL Configuration. Set Site URL to the Vercel address (no trailing slash) and add the same address and `http://localhost:3000` under Redirect URLs.
8. **Create the first admin.** Register an account in the live app, then run this in the SQL Editor:
   `update profiles set role = 'admin' where email = '<email>';`
   Log out and log in again to see the Admin badge.

### 7.6 Steps to update the application
1. Change the code locally and test with `npm run dev`.
2. Run `git add .`, `git commit -m "message"` and `git push`.
3. Vercel builds and deploys automatically. Check that the deployment shows Ready.
4. If an environment variable changes, update it in Vercel under Settings > Environment Variables, then redeploy (Deployments > the three dots > Redeploy), because changes only apply to new deployments.
5. If the database changes, run the new SQL in the Supabase SQL Editor.
6. To roll back, open Deployments in Vercel and use Instant Rollback on an earlier deployment.

### 7.7 Troubleshooting
| Problem | Likely cause and fix |
|---|---|
| "Invalid login credentials" on the live site only | The live site points to a different database. Check the two environment variables in Vercel, remove any extra integration variables, and redeploy. |
| Logged in but shown as User, with the email instead of a name | The profile cannot be read. Re-run the policies and grants in `schema.sql`, then log out and in. |
| Sign-up says to check email | "Confirm email" is still on in Supabase. Turn it off. |
| Changes in Vercel have no effect | Redeploy, as variables apply only to new deployments. |

### 7.8 Demo access
| Role | Email | Password |
|---|---|---|
| Admin | demoadmin@test.com | Admin@12345 |

## 8. Test cases and acceptance criteria
| ID | Test | Expected result | Result |
|---|---|---|---|
| T1 | Register a new user | Account is created and the dashboard opens with a User badge | Pass |
| T2 | Log in with a wrong password | An "Invalid login credentials" message is shown | Pass |
| T3 | Log in as admin | Admin badge and Users link are shown | Pass |
| T4 | Open any page while logged out | Redirected to the login page | Pass |
| T5 | Create an issue | Issue is saved and its page opens | Pass |
| T6 | Edit an issue and assign it to another user | Assignee is updated in the list and detail page | Pass |
| T7 | Change status to In Progress, then Closed | Status badge and dashboard counts update | Pass |
| T8 | Add a comment | Comment appears with author and time | Pass |
| T9 | Assigned user logs in | Issue appears under "Assigned to me" and the dashboard count is correct | Pass |
| T10 | Normal user opens the Users page | Link is hidden and direct access shows "Only admins can view this page" | Pass |
| T11 | Admin deletes an issue | Issue and its comments are removed and counts drop | Pass |
| T12 | Search and filter the issue list | Only matching issues are shown | Pass |

**Acceptance criteria:** all functional requirements FR1 to FR12 work on the live URL, an admin and a user can complete the full flow (register, create, assign, comment, close), and the documentation is enough for another developer to run and deploy the project.

## 9. Assumptions and constraints
- Users have a modern web browser and an internet connection.
- Email confirmation is turned off so reviewers can register instantly. For production it should be turned on.
- The free tiers of Vercel and Supabase have usage limits. A free Supabase project may pause after a period of inactivity.
- Demo credentials are for review only and should be removed or changed after evaluation.

## 10. Future improvements
Email notifications, password reset, issue priorities and labels, file attachments, multiple projects, and an activity history for each issue.