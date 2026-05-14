# EcoTrack

Smart Waste Management Operations Dashboard

EcoTrack is a full-stack assignment project built around the original team task manager requirements, but mapped to a realistic smart waste management use case. Admins manage waste zones, add field members, assign collection or inspection tasks, and track progress. Members see assigned work and update task status.

## Submission Links

| Item | Link |
|---|---|
| Live URL | Add Railway or Vercel URL here |
| GitHub Repository | Add repository URL here |
| Demo Video | Add recorded demo URL here |

## Problem Statement

Municipal teams, campuses, societies, and facility teams often manage waste collection work manually. This causes missed pickups, unclear ownership, delayed complaint resolution, and weak visibility into overdue work. EcoTrack gives the team one dashboard for zones, field members, tasks, statuses, due dates, and high-priority alerts.

## Feature Checklist

- JWT signup, login, logout, and current-user API
- Admin and Member roles
- Waste zones as projects
- Project membership for field teams
- Waste tasks with status, priority, category, due date, project, assignee, and creator
- Admin-only create/update/delete for zones and tasks
- Member-only assigned task view and status update
- Dashboard summary for total zones, tasks, status counts, overdue work, and high-priority alerts
- REST API with validation, clean JSON responses, and error handling
- PostgreSQL database with Prisma ORM
- Realistic seed data for demo
- Railway deployment guide and demo video script

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Deployment | Railway |

## Architecture

```mermaid
flowchart LR
  A[Next.js Frontend] -->|Fetch with JWT| B[Express REST API]
  B --> C[Prisma ORM]
  C --> D[(PostgreSQL)]
```

The frontend stores the JWT in local storage after login. Every protected request sends `Authorization: Bearer <token>`. The backend validates the token, checks role permissions, runs Zod validation, and uses Prisma to read or write PostgreSQL data.

## Database Schema

Main models:

- `User`: Admin or Member account.
- `Project`: Waste zone, route, campaign, or location.
- `ProjectMember`: Join table connecting users to zones.
- `Task`: Waste operation assigned to a field member.

Relationships:

- One user can create many projects.
- One user can create many tasks.
- One user can be assigned many tasks.
- One project can have many members.
- One project can have many tasks.
- `ProjectMember` connects users and projects.

## Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create zones | Yes | No |
| Edit/delete own zones | Yes | No |
| Add/remove zone members | Yes | No |
| Create/assign tasks | Yes | No |
| Update any task in own zone | Yes | No |
| Delete tasks in own zone | Yes | No |
| View member zones | Yes | Yes, only joined zones |
| View tasks | Own zones | Assigned tasks only |
| Update task status | Own zone tasks | Assigned tasks only |

The backend enforces these rules through `authMiddleware`, `requireAdmin`, `requireProjectAccess`, and `requireTaskAccess`. The frontend also hides unavailable actions, but access control does not rely on the UI.

## API Documentation

All protected APIs require:

```http
Authorization: Bearer <jwt>
```

Success response:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Only admin users can perform this action"
}
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Fetch current logged-in user |

### Projects / Waste Zones

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List visible zones |
| POST | `/api/projects` | Admin creates zone |
| GET | `/api/projects/:id` | Get zone details |
| PUT | `/api/projects/:id` | Admin updates zone |
| DELETE | `/api/projects/:id` | Admin deletes zone |

### Project Members

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/:id/members` | List zone members |
| POST | `/api/projects/:id/members` | Admin adds member by email or user ID |
| DELETE | `/api/projects/:id/members/:userId` | Admin removes member |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List visible tasks with filters |
| POST | `/api/tasks` | Admin creates task |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Admin updates task |
| PATCH | `/api/tasks/:id/status` | Admin or assigned member updates status |
| DELETE | `/api/tasks/:id` | Admin deletes task |

Task filters:

```http
GET /api/tasks?status=TODO&priority=HIGH&category=OVERFLOW_INSPECTION&overdue=true
```

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Summary cards, recent tasks, assigned tasks |

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm

### Backend

Optional local PostgreSQL with Docker:

```bash
docker compose up -d
```

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend runs at:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/api/health
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

## Environment Variables

Backend:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecotrack?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=8080
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

Frontend:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
```

## Prisma Commands

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate deploy
npm run seed
```

## Demo Credentials

Admin:

```text
admin@ecotrack.com
Admin@123
```

Members:

```text
ravi@ecotrack.com
Member@123

sneha@ecotrack.com
Member@123

arjun@ecotrack.com
Member@123
```

## Railway Deployment

Railway supports long-running services and PostgreSQL database templates. It can detect build and start commands, but monorepos are clearer when each service has an explicit root directory and commands.

Useful official docs:

- Railway PostgreSQL: https://docs.railway.com/guides/postgresql
- Railway build and start commands: https://docs.railway.com/reference/build-and-start-commands
- Railway deployments: https://docs.railway.com/deployments

### Backend Service

1. Push the repository to GitHub.
2. Create a Railway project.
3. Add a PostgreSQL database.
4. Add a new service from GitHub for the backend.
5. Set service root directory to `backend`.
6. Add environment variables:
   - `DATABASE_URL` from Railway PostgreSQL
   - `JWT_SECRET`
   - `PORT`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
7. Set build command:

```bash
npm run build
```

8. Set start command:

```bash
npm run start
```

9. Run migrations:

```bash
npx prisma migrate deploy
```

10. Run seed if demo data is needed:

```bash
npm run seed
```

11. Test `/api/health`.

### Frontend Service

1. Add another Railway service from the same GitHub repository.
2. Set service root directory to `frontend`.
3. Add:

```env
NEXT_PUBLIC_API_URL="https://your-backend-url.railway.app/api"
```

4. Build command:

```bash
npm run build
```

5. Start command:

```bash
npm run start
```

6. Test signup, login, admin flow, member flow, and dashboard refresh.

## Screenshots

Add screenshots before submission:

- Landing page
- Admin dashboard
- Waste zones page
- Project details with members and tasks
- Tasks filter page
- Member dashboard

## Known Limitations

- Role selection is available during signup for assignment demo simplicity.
- There is no password reset flow.
- The app uses REST polling after writes instead of real-time updates.
- Admins manage only zones they created.
- File uploads and map-based route planning are intentionally out of scope.

## Future Improvements

- Invite-only member onboarding
- Map view for collection routes
- Email notifications for overdue work
- Audit log for status changes
- Pagination for large task lists
- Photo evidence upload for field completion
- Multi-tenant organization support
