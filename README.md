# KSITM Hackathon Project

Short description

This repository contains the client and server for the KSITM hackathon project.

Repository layout

- `client/` – frontend application (see `client/README.md`)
- `server/` – backend API (see `server/README.md`)
- `docker-compose.yml` – optional local services (Postgres, etc.)
- `pg_dump.sh` – database dump helper

Quick start (Linux, fish shell)

1. Start the database (uses Docker Compose):

```fish
# from repository root
docker compose up -d
```

2. Server (backend)

```fish
cd server
# install dependencies (bun is used in this repo)
bun install
# copy example env and fill values
cp .env.example .env
# start dev server
bun run dev
```

3. Client (frontend)

```fish
cd client
# install dependencies (check package manager in client/package.json)
# examples:
# bun install
# npm install
# pnpm install
# start dev server
# bun run dev
# npm run dev
```

Notes

- There are VS Code tasks configured for development that may start the server and database automatically. See the VS Code Tasks panel.
- See `server/README.md` and `client/README.md` for more details.

Contributing

Please open issues or pull requests. Add short, focused commits and a clear description of changes.

License

Specify project license here.
