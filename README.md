# OpsPulse

Infrastructure monitoring and AI-based early warning platform. Monitors server and API health in real-time, predicts failures before they happen using Linear Regression over latency history, and delivers critical alerts to mobile devices via Firebase.

## Architecture

```
web (React + Nginx :80)
    └── /api → backend:3000
backend (Node.js + Express + Prisma)
    ├── REST API (auth, servers, metrics)
    ├── Pinger engine (node-cron)
    └── ai-service:8000 (health score & threshold)
ai-service (Python + FastAPI)
db (PostgreSQL 16)
mobile (Native Android — FCM push alerts)
```

## Quick Start

```bash
cp .env.example .env        # fill in JWT_SECRET at minimum
docker compose up -d --build
```

- Web dashboard → http://localhost
- Backend API  → http://localhost:3000
- AI service   → http://localhost:8000

## Local Development

**Backend**
```bash
cd backend
cp .env.example .env        # set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev                 # http://localhost:3000
```

**AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```

**Web**
```bash
cd web
npm install
npm run dev                 # http://localhost:5173  (proxies /api → :3000)
```

**Mobile** — open `mobile/` in Android Studio, add `google-services.json` from Firebase Console, then run on emulator or device.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20 · Express · TypeScript · Prisma |
| Database | PostgreSQL 16 |
| AI Sidecar | Python 3.12 · FastAPI · scikit-learn |
| Web | React 18 · Vite · Tailwind CSS · Recharts |
| Mobile | Kotlin · Jetpack Compose · Hilt · Retrofit |
| Push | Firebase Cloud Messaging |
| DevOps | Docker Compose · GitHub Actions · GHCR |

## CI/CD

Every push to `main`:
1. **CI** — lint + build + test for backend, ai-service, and web (parallel)
2. **CD** — build & push Docker images to GHCR, then SSH deploy to production server

Required GitHub secrets for CD: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `JWT_SECRET`, `POSTGRES_PASSWORD`, `FCM_SERVER_KEY`.
