import os
import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from db import init_db, get_latest_indicators, get_map_buckets, upsert_indicator, get_conn

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    from services.scheduler import start_scheduler
    start_scheduler()
    yield
    from services.scheduler import stop_scheduler
    stop_scheduler()

app = FastAPI(title="OSINT Threat API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/indicators/latest")
async def api_indicators_latest(limit: int = Query(50, le=200), offset: int = Query(0, ge=0)):
    items = await get_latest_indicators(limit=limit, offset=offset)
    for r in items:
        if isinstance(r.get("tags"), str):
            try: r["tags"] = json.loads(r["tags"]) if r["tags"] else []
            except: r["tags"] = []
        if isinstance(r.get("geo"), str):
            try: r["geo"] = json.loads(r["geo"]) if r["geo"] else None
            except: r["geo"] = None
    return {"items": items, "limit": limit, "offset": offset}

@app.get("/api/map")
async def api_map():
    buckets = await get_map_buckets()
    return {"buckets": buckets}


# Stub endpoints for frontend compatibility (OSINT app does not use live flights/ships;
# useDataPolling still calls these — return empty data to avoid 404.)
@app.get("/api/live-data/fast")
async def api_live_data_fast():
    return {
        "commercial_flights": [],
        "private_flights": [],
        "private_jets": [],
        "military_flights": [],
        "tracked_flights": [],
        "ships": [],
        "cctv": [],
        "gps_jamming": [],
        "satellites": [],
    }


@app.get("/api/live-data/slow")
async def api_live_data_slow():
    return {
        "news": [],
        "earthquakes": [],
        "gdelt": [],
        "frontlines": None,
        "kiwisdr": [],
        "space_weather": {"kp_index": None, "kp_text": "N/A", "events": []},
        "internet_outages": [],
        "firms_fires": [],
        "datacenters": [],
        "military_bases": [],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
