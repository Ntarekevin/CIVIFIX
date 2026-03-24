# 🛡 CiviFix

**Anonymous civic issue reporting platform for Rwanda.**

Report corruption, poor public service, security threats, and discrimination — safely and anonymously. No account required.

---

## Features

- 🕵️ **Fully anonymous** — no accounts, no tracking, no PII stored
- 🗺 **Map-based reports** — pin locations via Leaflet; coordinates obfuscated on public dashboard
- 📁 **Media uploads** — photos/videos with automatic EXIF stripping
- 🔑 **Tracking token** — check your report status anytime, no login needed
- 📡 **Works offline** — PWA with IndexedDB queue, auto-syncs on reconnect
- 🏛 **Authority portal** — JWT-secured endpoints for reviewing full details & updating status

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + PWA (vite-plugin-pwa) |
| Map | Leaflet + CartoDB dark tiles |
| Offline | localForage (IndexedDB) + Workbox service worker |
| Backend | Node.js + Express |
| Database | PostgreSQL 14 + PostGIS + pgcrypto |
| Auth | JWT (authorities only) |
| Media | AWS S3 (or local fallback), sharp for EXIF stripping |
| CI | GitHub Actions |

---

## Quick Start

```bash
# Backend
cd backend
copy .env.example .env   # fill in DB_PASSWORD + JWT_SECRET
npm install
npm run dev              # → http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev              # → http://localhost:5173
```

See the full setup guide for database initialization and production deployment steps.

---

## Project Structure

```
CIVIFIX/
├── backend/       Node.js / Express API
├── frontend/      React + Vite PWA
└── .github/       CI workflows
```

---

## License

MIT — open source civic tech for Rwanda 🇷🇼
