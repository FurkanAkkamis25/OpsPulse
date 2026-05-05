# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpsPulse is an infrastructure (server/API) monitoring and AI-based early warning platform. It doesn't just report "server is down" — it predicts "server may go down within the next hour" using a Health Score derived from historical latency trends.

## Architecture: Pragmatic Monolith

The system is structured as a **modular monolith** with one sidecar AI service. All components are Docker-ready and orchestrated via Docker Compose.

```
opspulse/
├── backend/        # Node.js + Express + TypeScript (API + Pinger engine)
├── ai-service/     # Python + FastAPI (Health Score & Dynamic Threshold)
├── web/            # React + Tailwind CSS + Recharts
├── mobile/         # Native Android (Kotlin + Jetpack Compose)
└── docker-compose.yml
```

### Backend (`backend/`) — Node.js + TypeScript + Express + Prisma
The monolith contains both the REST API and the Pinger engine in the same process:
- **API layer**: Handles auth, server registration, metrics retrieval, threshold config
- **Pinger engine**: Scheduled jobs that ping registered endpoints, store latency/status results in PostgreSQL, and trigger FCM alerts when thresholds are breached
- **Prisma ORM** maps to PostgreSQL for both user data and time-series ping logs
- Calls the AI sidecar (`ai-service`) to get Health Scores and Dynamic Thresholds per monitored server

### AI Service (`ai-service/`) — Python + FastAPI
A lightweight sidecar that the backend calls via HTTP. Responsibilities:
- Receives historical latency arrays from the backend
- Runs **Linear Regression** to compute a **Health Score (0–100)** and predict failure risk
- Returns Dynamic Threshold recommendations back to the backend
- Has no database of its own; stateless per request

### Web (`web/`) — React + Tailwind CSS + Recharts
Dashboard and management UI:
- Add/remove monitored servers
- View real-time and historical performance charts (Recharts)
- Manage AI-determined Dynamic Thresholds

### Mobile (`mobile/`) — Kotlin + Jetpack Compose (Native Android)
Field tool for on-call engineers:
- Receives **Critical Alarm** notifications via Firebase Cloud Messaging (FCM) even when the app is closed (foreground service)
- Shows real-time system health status

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js + TypeScript |
| Backend framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| AI sidecar | Python + FastAPI |
| Web framework | React.js |
| Web styling | Tailwind CSS |
| Web charts | Recharts |
| Mobile | Kotlin + Jetpack Compose |
| Push notifications | Firebase Cloud Messaging (FCM) |
| DevOps | Docker Compose + GitHub Actions |

## Commands

### Backend
```bash
cd backend
npm install           # Install dependencies
npm run dev           # Start dev server (ts-node / nodemon)
npm run build         # Compile TypeScript → dist/
npm start             # Run compiled output
npm test              # Run tests
npm run lint          # ESLint

npx prisma migrate dev        # Apply DB migrations (dev)
npx prisma migrate deploy     # Apply DB migrations (prod)
npx prisma generate           # Regenerate Prisma client after schema changes
npx prisma studio             # Open Prisma GUI
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload     # Dev server (port 8000)
uvicorn main:app --host 0.0.0.0 --port 8000  # Production
pytest                        # Run tests
```

### Web
```bash
cd web
npm install
npm run dev           # Vite dev server
npm run build         # Production build
npm run lint          # ESLint
```

### Docker Compose (full stack)
```bash
docker compose up -d          # Start all services
docker compose up -d --build  # Rebuild and start
docker compose logs -f backend
docker compose down
```

## Key Design Decisions

- **Monolith over microservices**: The API and Pinger engine share one Node.js process and one DB connection pool, simplifying deployment and debugging at this stage.
- **AI as sidecar, not integrated**: Keeping Python isolated avoids forcing the Node.js monolith to embed ML dependencies; the HTTP boundary also makes the AI service independently replaceable.
- **PostgreSQL for time-series**: Ping logs (latency, status, timestamp) are stored in regular PostgreSQL tables. If query performance becomes a bottleneck at scale, migrate the logs table to TimescaleDB (a PostgreSQL extension) without changing the rest of the stack.
- **FCM for mobile alerts**: Native Android + FCM allows Critical Alarm delivery even when the app is killed, which a PWA or cross-platform solution cannot reliably guarantee.
