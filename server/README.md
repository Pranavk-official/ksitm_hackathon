To install dependencies:
```sh
```

```sh
```

## Server

This is the backend API for the KSITM hackathon project.

Quick overview

- Language/runtime: TypeScript + Bun (the project uses `bun` in the `server/` folder).
- ORM / schema: Prisma is present under `prisma/` (see `prisma/schema.prisma`).

Prerequisites

- bun (https://bun.sh)
- Docker & Docker Compose (for local Postgres if needed)

Local development (fish shell)

1. Copy environment file and set values

```fish
cd server
cp .env.example .env
# Edit .env and fill database and other secrets
```

2. Install dependencies

```fish
bun install
```

3. Database (if using Docker Compose from repository root)

```fish
# from repo root
docker compose up -d
```

4. Run migrations (if you need to apply Prisma migrations)

```fish
# You may need to run via npx/pnpm depending on your environment
npx prisma migrate deploy
# or
npx prisma migrate dev
```

5. Start dev server

```fish
bun run dev
```

App URL

Open http://localhost:3000 (or the port configured in `.env`) in your browser.

Useful notes

- There is an example `.env.example` in this folder. Copy it to `.env` before starting.
- Prisma schema lives in `prisma/schema.prisma`. Migrations are in `prisma/migrations`.
- If you get errors about missing environment variables, double-check `.env`.

Troubleshooting

- If bun commands are not found, install bun and ensure it's on your PATH.
- If the DB connection fails, ensure Docker is running and compose bring-up succeeded.

Contact

For questions about the backend, talk to the backend owner or open an issue.

## API Docs (OpenAPI)

This project includes a config for `@rcmade/hono-docs` to generate an OpenAPI 3.0 JSON file.

To generate the docs:

```fish
cd server
# install generator (optional)
bun add -d @rcmade/hono-docs
bun run docs:generate
```

The generated OpenAPI JSON will be written to `openapi/openapi.json` and is served by the running server at `/docs/open-api`. A Redoc UI is available at `/docs`.

If you prefer to run without installing the package, use npx from the repo root:

```fish
npx @rcmade/hono-docs generate --config ./hono-docs.ts
```

