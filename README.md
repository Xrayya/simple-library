# Simple Library Management System (WIP)

A work-in-progress full-stack library management system with a React frontend and Hono backend.

> Status: **WIP** — core authentication is implemented; library domain features are partially implemented.

## Overview

This repository contains:

- `frontend/`: React + Vite client app
- `backend/`: Hono API (Cloudflare Workers runtime style) with Drizzle + PostgreSQL

The project is currently focused on auth flows and early book APIs while broader library workflows (borrowing/loans/admin panels) are still in progress.

## Features

### Public / Customer

#### Implemented

- User registration (email, username, password)
- User login (cookie/non-cookie behavior based on client type)
- Token refresh and logout
- Authenticated access to books route (connectivity/protected-route check)

#### Planned / Incomplete

- Public catalog browsing (currently books endpoint is protected)
- Book detail pages
- Borrow request creation flow

### Admin

#### Implemented

- Auth functionalities (register, login, logout, token management) (`/auth`)

#### Planned / Incomplete

- Full books CRUD (update/delete not implemented)
- Borrowing request / loan management UI and API
- Role-based admin UI and backend authorization policies

## Tech Stack

### Frontend

- React 19
- Vite
- TanStack Router
- TanStack Query
- TanStack Form
- Tailwind CSS v4
- shadcn/ui + Radix UI

### Backend

- Hono
- Cloudflare Workers tooling via Wrangler
- Drizzle ORM
- PostgreSQL (`postgres` driver)
- Zod validation
- JWT via `jose`
- Password hashing via `bcrypt-ts`

## Architecture

- Frontend calls backend via `VITE_BACKEND_URL`.
- Backend API base path: `/api/v1`.
- Auth supports browser cookie flows and non-browser token payload flows.
- Data model includes users, categories, books, borrow logs, and refresh tokens.

## Routes

### Frontend routes

- `/`
- `/about`
- `/login`
- `/register`
- `/books` (inside auth-protected layout)

### Backend routes (base: `/api/v1`)

- `/auth/register`
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`
- `/auth/me`
- `/books` (`GET`, `POST`)

## Getting Started

## 1) Prerequisites

- Bun and/or Node.js
- PostgreSQL database
- Wrangler CLI environment for backend runtime simulation

## 2) Clone and configure env

### Backend env (`backend/.env`)

Required:

- `DATABASE_URL`
- `DATABASE_TABLE_PREFIX`
- `SECRET_KEY`

### Frontend env (`frontend/.env`)

Required:

- `VITE_BACKEND_URL` (example: `http://localhost:8787/api/v1`)

## 3) Install dependencies

### Backend

```bash
cd backend
bun install
# (npm install also works with existing scripts, but lockfile is Bun)
```

### Frontend

```bash
cd frontend
bun install
```

## 4) Run locally

### Backend

```bash
cd backend
bun run dev
```

### Frontend

```bash
cd frontend
bun run dev
```

Frontend defaults to port `3000`.

## Environment Variables

### Backend

- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_TABLE_PREFIX`: prefix used in table names
- `SECRET_KEY`: JWT signing secret

### Frontend

- `VITE_BACKEND_URL`: backend API base URL

## Database

Current state:

- Drizzle schema is defined in `backend/src/db/schema.ts`.
- Drizzle config exists in `backend/drizzle.config.ts`.
- No checked-in migration output folder or seed script is present yet.

## Deployment (plan)

- Supabase will be used for database deployment
- Cloudflare worker will be used for backend
- Vercel will be used for frontend
