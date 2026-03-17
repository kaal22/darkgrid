# DarkGrid – Global Threat Intelligence Dashboard

OSINT threat‑intel dashboard: a 3D globe and live feed showing malicious infrastructure from public sources like AbuseIPDB and OpenPhish.

---

## Overview

DarkGrid visualizes suspicious internet infrastructure globally:

- **3D threat globe** with pulsing country “pings” based on indicator volume.
- **Threat feed** of latest IPs / URLs from OSINT collectors.
- **Find / Locate bar** to jump to indicators or geographic locations.
- **Intel pane** for context cards (threat clusters, region dossiers, news, etc.).

The focus is **situational awareness of infrastructure**, not individuals.

---

## Project structure

- `backend/` – FastAPI + SQLite OSINT API  
  - Collectors: AbuseIPDB (IPs), OpenPhish (URLs)  
  - Scheduler runs collectors on startup and every 15 minutes  
  - `/api/indicators/latest` – latest indicators for the feed  
  - `/api/map` – per‑country buckets for the globe
- `frontend/` – Next.js 16 app (DarkGrid UI)  
  - `src/app/page.tsx` – main dashboard layout  
  - `src/components/ThreatGlobeViewer.tsx` – 3D globe  
  - `src/hooks/useThreatDataPolling.ts` – polls threat API
- `docker-compose.yml` – local stack (backend + frontend)

---

## Quick start (Docker)

1. **Create `.env`** in this directory (same folder as `docker-compose.yml`):

   ```bash
   copy .env.example .env
   ```

   Edit `.env` and set:

   - **`ABUSEIPDB_API_KEY`** – get a free key from `https://www.abuseipdb.com/`.

2. **Start the stack:**

   ```bash
   docker-compose up -d
   ```

   Or run in the foreground to see logs:

   ```bash
   docker-compose up
   ```

3. **Open the UI and API:**

   - Dashboard: `http://localhost:3000`  
   - Backend API: `http://localhost:8000`  
   - Health: `http://localhost:8000/health`

4. **Rebuild after code changes:**

   ```bash
   docker-compose up -d --build
   ```

---

## Data & ingestion

- **Database:** SQLite, created automatically on first backend start.  
  - In Docker, data is in the `backend_data` volume at `/app/data/threat_intel.db`.  
  - In local dev (no Docker), data is at `backend/data/threat_intel.db`.

- **Collectors (run on startup and every 15 minutes):**

  - **AbuseIPDB** (requires `ABUSEIPDB_API_KEY`):
    - Produces `type=ip`, `source=abuseipdb` indicators with `geo.country`.
    - Feeds both the **threat feed** and the **globe pings** (country buckets).

  - **OpenPhish** (no key required):
    - Produces `type=url`, `source=openphish` indicators (no geo).
    - Shows up in the **threat feed** only (no globe pings).

- **Empty globe / feed troubleshooting:**

  - If the globe has **no pings** and the feed is empty:
    - Check `.env` and make sure `ABUSEIPDB_API_KEY` is set and valid.
    - Restart: `docker-compose up -d`.
    - Wait a few minutes for the first collector run, then refresh the UI.

---

## Local development (without Docker)

Requirements:

- Python 3.11+  
- Node.js 20+

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # on Windows
pip install -r requirements.txt
python main.py  # serves on http://localhost:8000
```

Make sure your root `.env` has `ABUSEIPDB_API_KEY` for ingestion.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (for local dev only):

```bash
NEXT_PUBLIC_THREAT_API_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Status

This project is a **work in progress** and represents a **rough MVP** of the DarkGrid threat intelligence dashboard. Expect breaking changes as the backend, collectors, and UI are refined.

Planned future stages include:

- **Richer globe pings**: more granular buckets, refined sizing/animation, and better click‑through behavior.  
- **Additional OSINT sources**: more IP / URL / domain reputation and malware feeds beyond AbuseIPDB and OpenPhish.  
- **Deeper indicator intel**: expanded details for each indicator and country cluster.

