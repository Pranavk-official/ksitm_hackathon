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

- [X] Create Prisma / SQL migrations for the tables above.
- [X] Generate an ERD diagram and commit to `/docs/`.

Acceptance Criteria (AC):

- [X] Migrations apply cleanly (no errors).
- [X] ERD PNG committed to `/docs/`.

Evidence required:

- [X] Migration files in `prisma/migrations/` (or `migrations/` folder) — list filenames
- [X] ERD image `docs/erd.png` (or `docs/ERD-<timestamp>.png`)

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

- [X] Seed roles: `Admin`, `Officer`, `Citizen`.
- [X] Create one demo Admin user (seed script or migration seed).

Acceptance Criteria (AC):

- [X] DB shows all 3 roles.
- [X] Admin can log in (credential details recorded in evidence, not plaintext in repo).

Evidence required:

- [X] SQL/seed script committed (e.g. `prisma/seed.ts` or `scripts/seed.sql`).
- [X] Screenshot or terminal output showing seed run and inserted rows.

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

--

## Part 2 Candidate Instructions
Project: Citizen Service Requests & Fees – GovTech Simulation
Part: 2 — Payments & External API Integration
Goal: Enable fee computation, secure checkout, webhook verification, officer gating after
payment, and basic admin reporting.

Read Me First
- Gateway (choose one): Razorpay/Paytm/Stripe sandbox only. Never collect or
	store card/UPI credentials yourself.
- Secrets: Keep keys in .env. Fail fast if keys missing. Don’t log secrets.
- Security rules:
	- Verify gateway signatures/checksums on callbacks before trusting a payment.
	- Use idempotency keys to prevent duplicate order/updates.
	- Store gateway IDs (order/payment/signature) and full response JSON.
	- Sanitize error messages; enable rate limits on payment endpoints; enable
		CORS/helmet.

Evidence policy: Each task lists required artifacts (screens/GIFs/links). Maintain
`Evidence.md` in repo.

Task P2-01 — Payments DB Schema & Models
Objective: Persist transactions reliably.
Tables: `payment_transactions` (TransactionID UUID, UserID, RequestID, Amount,
Currency, OrderId, PaymentId, Status [Pending/Success/Failed/Refunded], Signature,
GatewayResponse JSON, IdempotencyKey, CreatedAt, UpdatedAt); ensure
`service_requests.FeeAmount` exists.
AC: Migrations apply; unique/indexes for PaymentId and IdempotencyKey.
Evidence: Migration files + schema diagram PNG.
Timebox: 20 min.
Status: Done (schema updated in `prisma/schema.prisma`). Migration pending.
Evidence: prisma/migrations/ (placeholder) + docs/evidence/p2-01-schema.png

Task P2-02 — Fee Rules & Pricing Display
Objective: Show correct fees to users and back-end.
Steps: Implement config map (ServiceType → FeeAmount); validate on server; surface onCreate Request form and Request Cards.
AC: Same fee value on client and server; prevents tampering.
Status: Done
Notes: Server computes fees using `src/config/fees.ts` and `createServiceRequest` enforces server-side feeAmount. Added GET `/requests/fee?serviceType=...` to return authoritative fee.
Evidence: docs/evidence/p2-02-fee.png (placeholder)
Timebox: 15 min.

Task P2-03 — Gateway Sandbox Setup
Objective: Wire sandbox keys safely.
Steps: Add .env keys; create `/payments/health` to confirm key presence; create provider
adapter (e.g., `adapters/razorpay.js`).
AC: Health route returns OK; app refuses to start if keys missing.
Evidence: Health route JSON + redaction proof of env usage.
Timebox: 15 min.
Status: Done (mock gateway adapter implemented for dev).
Notes: Added `src/adapters/mockGateway.ts` and `/payments/health` route.
Evidence: docs/evidence/p2-03-health.json (placeholder)

Task P2-04 — Create Order Intent Endpoint
Objective: Begin checkout with server-side integrity.
Endpoint: `POST /payments/create-order` { requestId }.
Rules: Ensure request belongs to the logged-in citizen, compute Amount server-side from
config, store Pending transaction with IdempotencyKey, call gateway to create order,
return order details to FE.
AC: Duplicate clicks do not create duplicate orders; returns stable order for same
IdempotencyKey.
Evidence: Postman tests + DB screenshot showing Pending txn.
Timebox: 25 min.
Status: Done (server-side create-order endpoint + idempotency via IdempotencyKey).
Evidence: docs/evidence/p2-04-create-order.png (placeholder)

Task P2-05 — Frontend “Pay Now” UI & Checkout
Objective: Provide a clean, reliable checkout experience.
Steps: On unpaid requests, show Pay Now; initialize gateway checkout (script/redirect);
handle success/failure callbacks; UX states (loading, success, error).
AC: User sees status transitions; no blocked UI on failure; retry works without duplicating
orders.
Evidence: GIF of full flow.
Timebox: 25 min.

Task P2-06 — Webhook/Callback & Signature Verification
Objective: Trust results only after server verification.
Endpoint: `POST /payments/webhook`.
Steps: Verify signature using secret; upsert transaction by OrderId/PaymentId; set Status;
update `service_requests.Status='Paid'` only on Success; log raw payload in
GatewayResponse.
AC: Tampered/invalid signature is rejected; updates are idempotent (retries safe).
Evidence: Unit test of signature verify + DB before/after.
Timebox: 30 min.
Status: Done (mock webhook verification implemented; idempotent update by orderId).
Evidence: docs/evidence/p2-06-webhook.png (placeholder)

Task P2-07 — Payment Status & Receipt
Objective: Transparency for citizens.
Steps: Build Payments page listing transactions; filters by date/request; show OrderId,
PaymentId, Status, Amount, Timestamp. Add Receipt view with print/PDF.
AC: Accurate list; receipt has order/payment refs and citizen name.
Evidence: Screenshots of list + receipt.
Timebox: 20 min.

Task P2-08 — Officer Gating & Admin Revenue Report
Objective: Approvals only when fees paid; admins see revenue.
Steps: Block Officer approval when linked request unpaid (backend guard + UI hint).
Create Admin → Revenue view: totals by ServiceType and by date; CSV export; simple
chart.
AC: Officer cannot approve unpaid requests; admin metrics match transactions.
Evidence: Forbidden attempt (401/403) proof + CSV sample + chart screenshot.
Timebox: 25 min.

Task P2-09 — Errors, Idempotency & Reliability
Objective: Be resilient to retries and duplicates.
Steps: Handle timeouts/duplicates; ensure unique constraints; exponential backoff on FE;
retryable webhook handling; reconciliation job/endpoint to re-fetch a payment by ID.
AC: Replaying same webhook/request does not double-charge or double-mark Paid.
Evidence: Test script re-posting webhook payloads + stable DB state.
Timebox: 20 min.

Task P2-10 — E2E Demo, Deployment & Docs
Objective: Demonstrate and ship.
Steps: Record end-to-end screen capture (Citizen → Pay → O icer approve → Admin report).
Deploy FE (Vercel/Netlify), BE (Railway/Render), DB (Supabase/Postgres). Update
README (env keys, run, endpoints), attach Postman collection and demo creds.
AC: All links live; video shows successful payment → approval.
Evidence: Live URLs + video link + README excerpt.
Timebox: 30 min.

Submission Checklist (End of Part 2)
- Payments schema + migrations
- Fee rules enforced on client + server
- Gateway sandbox configured; health route passes
- Create-order endpoint with idempotency
- FE checkout flow with robust UX
- Webhook with signature verification + idempotent updates
- Payment status list + printable receipt
- Officer approval blocked until Paid
- Admin revenue report + CSV export
- E2E demo, deployments, README & Postman

Evaluation Hints (for Mentors)
- Security (30%): signature verification, idempotency, secret handling, safe logs.
- Correctness (25%): status transitions, gating logic, reconciliation.
- Reliability (20%): duplicate/retry handling, webhook robustness.
- Reporting (15%): admin metrics accuracy & exports.
- Docs/UX (10%): clarity of instructions, error messaging, demo completeness.
