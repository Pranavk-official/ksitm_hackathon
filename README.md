# KSITM Hackathon Project

A secure group chat application for campus with role-based access control, built with Next.js, Hono, and PostgreSQL.

## Features

- **Landing Page**: Public page with app overview and navigation
- **Authentication**: Signup and login with JWT tokens (Access + Refresh)
- **Role-based Access**: Support for Citizen, Officer, and Admin roles
- **Dashboard**: Protected dashboard for authenticated users
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React Query, Tailwind CSS, TypeScript
- **Backend**: Hono, Prisma, PostgreSQL, JWT authentication
- **Database**: PostgreSQL with Docker Compose setup

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Docker and Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ksitm_hackathon
```

### 2. Start Database

```bash
# From repository root
docker compose up -d
```

### 3. Setup Backend

```bash
cd server
cp .env.example .env
# Edit .env with your database URL and JWT secrets
bun install
bun run dev
```

The server will start on `http://localhost:3000`

### 4. Setup Frontend

```bash
cd client
bun install
bun run dev
```

The client will start on `http://localhost:3001`

## Usage

### Authentication Flow

1. **Landing Page**: Visit the homepage to see app overview
2. **Signup**: Create a new account with name, email, mobile, and password
3. **Login**: Sign in with your email and password
4. **Dashboard**: Access protected dashboard after authentication
5. **Logout**: Sign out and clear session

### API Endpoints

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate user and receive tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Sign out and revoke tokens

## Development

### Available Scripts

#### Server
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server

#### Client
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server

### VS Code Tasks

The project includes VS Code tasks for:
- Running the development server
- Running the client
- Starting Docker database

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/app/
│   │   ├── auth/          # Authentication pages
│   │   ├── components/    # Reusable components
│   │   ├── dashboard/     # Protected dashboard
│   │   ├── hooks/         # React Query hooks
│   │   ├── providers/     # Context providers
│   │   └── utils/         # Utilities
├── server/                 # Hono backend
│   ├── prisma/            # Database schema and migrations
│   ├── src/
│   │   ├── module/        # Feature modules
│   │   ├── middlewares/   # Custom middlewares
│   │   ├── shared/        # Shared utilities
│   │   └── routes/        # Route definitions
└── docker-compose.yml      # Database setup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the KSITM hackathon.
