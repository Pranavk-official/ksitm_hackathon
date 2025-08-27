# Evidence & Checklist

This document tracks task acceptance criteria and required evidence for the P1 feature set.

Instructions: for each task fill the Evidence items (attach screenshots, files, or links). Use the checkboxes to track completion.

## Summary checklist

- [X] P1-01 — Repo & Environment Setup
- [X] P1-02 — Core DB Schema
- [X] P1-03 — Seed Roles & Admin
- [ ] P1-04 — Landing Page (Public)
- [ ] P1-05 — Signup (Citizen)
- [ ] P1-06 — Login + JWT (Access/Refresh)
- [ ] P1-07 — Forgot/Reset Password
- [ ] P1-08 — RBAC Middleware & Route Guards
- [ ] P1-09 — Minimal Dashboards by Role
- [ ] P1-10 — Audit Logging & Security Basics

---

## Task P1-01 — Repo & Environment Setup

Objective: Start cleanly with predictable developer experience.

Steps (completed items):

- [X] Initialize FE & BE repos with standard scripts: `dev`, `build`, `start`.
- [X] Create `.env.example` with `DB_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
- [X] Enable lint/format (ESLint + Prettier).

Acceptance Criteria (AC):

- [X] Repos run locally with `dev`.
- [X] `build` succeeds for FE and BE.

Evidence required (attach here):

- [X] `README.md` (setup instructions) — path: `/README.md`
- [X] Screenshot of running FE at `http://localhost:xxxx` (include port) — attach image
- [X] Screenshot of BE health route (`/health`) showing 200/OK — curl output or browser screenshot
- [X] Copy of `.env.example` committed — path: `/server/.env.example` (or `/client/.env.example` if present)

Timebox: 20 min

Quick verification commands (run and paste outputs):

```fish
# from repo root
docker compose up -d

# server
cd server
cp .env.example .env
bun install
bun run dev  # or npm/pnpm as appropriate

# health check (replace port if different)
curl -i http://localhost:3000/health
```

---

## Task P1-02 — Core DB Schema

Objective: Persist users, roles, citizen requests, and audits.

Required tables (schema):

- `users(UserID, Name, Email, Mobile, Salt, PasswordHash, Role, CreatedAt)`
- `roles(RoleID, RoleName)`
- `service_requests(RequestID, UserID, ServiceType, Description, FeeAmount, Status, CreatedAt)`
- `audit_logs(LogID, UserID, Action, Timestamp)`

Steps:

- [ ] Create Prisma / SQL migrations for the tables above.
- [ ] Generate an ERD diagram and commit to `/docs/`.

Acceptance Criteria (AC):

- [ ] Migrations apply cleanly (no errors).
- [ ] ERD PNG committed to `/docs/`.

Evidence required:

- [ ] Migration files in `prisma/migrations/` (or `migrations/` folder) — list filenames
- [ ] ERD image `docs/erd.png` (or `docs/ERD-<timestamp>.png`)

Timebox: 25 min

Quick verification commands (example):

```fish
# from server
npx prisma migrate dev --name init
# or show migrations folder
ls -la prisma/migrations
```

---

## Task P1-03 — Seed Roles & Admin

Objective: Guarantee initial access paths.

Steps:

- [ ] Seed roles: `Admin`, `Officer`, `Citizen`.
- [ ] Create one demo Admin user (seed script or migration seed).

Acceptance Criteria (AC):

- [ ] DB shows all 3 roles.
- [ ] Admin can log in (credential details recorded in evidence, not plaintext in repo).

Evidence required:

- [ ] SQL/seed script committed (e.g. `prisma/seed.ts` or `scripts/seed.sql`).
- [ ] Screenshot or terminal output showing seed run and inserted rows.

Timebox: 10 min

Quick verification:

```fish
# run seed (example)
node prisma/seed.js
# or
npx prisma db seed
psql $DB_URL -c "select * from roles;"
```

---

## Task P1-04 — Landing Page (Public)

Objective: Explain app & route users to auth.

Content:

- App overview, role capabilities, links to Login/Signup.

Acceptance Criteria (AC):

- [ ] Responsive layout.
- [ ] Lighthouse score ≥ 80 (performance + accessibility recommended).

Evidence required:

- [ ] Screenshot of landing page on desktop and mobile widths.
- [ ] Short video/GIF demonstrating navigation to Login/Signup.
- [ ] Lighthouse or `lighthouse-ci` output or screenshot.

Timebox: 15 min

---

## Task P1-05 — Signup (Citizen)

Objective: Secure self-registration for citizens.

Fields: Name, Email (unique), Mobile, Password, Confirm Password.

Rules:

- Strong client + server validation.
- On success store Salt + SHA-256 hash; default Role=Citizen.

Acceptance Criteria (AC):

- [ ] Invalid inputs blocked with clear messages.
- [ ] User row created with `salt` and `passwordHash` (no plaintext password stored).

Evidence required:

- [ ] Screenshots of validation messages (client + server responses).
- [ ] DB row screenshot showing `salt` and `passwordHash` columns populated and plaintext not present.

Timebox: 25 min

Quick verification:

```fish
# signup curl example
curl -i -X POST http://localhost:3000/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"name":"Test Citizen","email":"test@example.com","mobile":"1234567890","password":"P@ssw0rd!","confirmPassword":"P@ssw0rd!"}'

# check in DB (psql example)
psql $DB_URL -c "select name, email, salt, passwordhash from users where email='test@example.com';"
```

---

## Task P1-06 — Login + JWT (Access/Refresh)

Objective: Standards-compliant session management.

Steps:

- [ ] Issue Access and Refresh tokens on login.
- [ ] Implement `/auth/refresh` and `/auth/logout`.
- [ ] Use short-lived Access token and secure storage (httpOnly cookies recommended).

Acceptance Criteria (AC):

- [ ] Login works; protected route accessible only with valid Access token.
- [ ] Refresh rotates tokens.
- [ ] Logout revokes tokens.

Evidence required:

- [ ] Postman collection with tests (commit `postman_collection.json` or link).
- [ ] Short demo GIF showing login, accessing a protected route, refresh, and logout.

Timebox: 30 min

---

## Task P1-07 — Forgot/Reset Password

Objective: Allow safe credential recovery.

Steps:

- [ ] `/auth/forgot` issues a single-use, time-bound reset token (email mocked to console/log).
- [ ] `/auth/reset` consumes the token and sets a new salted hash.

Acceptance Criteria (AC):

- [ ] Token usable once within TTL; invalid afterward.
- [ ] Strong password rules enforced on reset.

Evidence required:

- [ ] Console/log screenshot showing token issuance.
- [ ] Screenshots showing reset flow success and DB update for hash/salt.

Timebox: 20 min

---

## Task P1-08 — RBAC Middleware & Route Guards

Objective: Enforce least privilege across API and UI.

Server steps:

- [ ] Middleware checks role per route scope.

Client steps:

- [ ] Route guards and conditional menus per role.

Acceptance Criteria (AC):

- [ ] Citizen cannot access Officer/Admin endpoints; Officer cannot manage users; Admin can manage roles/users.
- [ ] Unauthorized attempts return 401/403 with friendly UI messages.

Evidence required:

- [ ] Postman tests hitting forbidden endpoints (show 401/403 responses).
- [ ] UI screenshots showing role-specific menus.

Timebox: 25 min

---

## Task P1-09 — Minimal Dashboards by Role

Objective: Demonstrate working role experiences.

User stories / features:

- Citizen: Create new service request (ServiceType, Description, FeeAmount placeholder) and view my requests.
- Officer: View all requests, Approve/Reject with note.
- Admin: Manage users (list, set role), view audits (read-only).

Acceptance Criteria (AC):

- [ ] CRUD paths succeed with validations.
- [ ] Officer actions update request status.

Evidence required:

- [ ] GIF walkthrough per role demonstrating flows.
- [ ] Sample data JSON file (`docs/sample-data.json`) showing created entities.

Timebox: 40 min

---

## Task P1-10 — Audit Logging & Security Basics

Objective: Trace critical actions and raise the security floor.

Requirements:

- Audit events: `login`, `logout`, `signup`, `reset-password`, `role-change`, `request create/update`.
- Security: input validation (zod/celebrate/yup), rate-limit auth endpoints, CORS config, helmet headers, safe error handling.

Acceptance Criteria (AC):

- [ ] `audit_logs` populated with correct timestamps and user IDs for the actions above.
- [ ] Basic security middleware active and visible in server config.

Evidence required:

- [ ] Screenshot of `audit_logs` rows (DB) showing sample events.
- [ ] Snippet of server middleware config committed (path and filename).

Timebox: 25 min

---

## How to attach evidence

- Place screenshots and GIFs in a folder `docs/evidence/` and reference them here (example: `docs/evidence/p1-01-fe-screenshot.png`).
- Commit migration and seed files under `prisma/migrations/` and `prisma/seed.ts` or `scripts/seed.sql`.
- Postman collections can be added to `docs/postman/`.

---

## Completion notes

When a task is completed, check its box in the Summary checklist above and attach the listed evidence items. If you want I can populate any of the evidence placeholders (for example run the health curl, create a seed script, or generate a sample ERD) — tell me which item to produce next.
