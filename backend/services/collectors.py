"""OSINT collectors: AbuseIPDB, OpenPhish. Normalize to indicator rows."""
import os
import json
import time
import httpx

def now_ts():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

async def collect_abuseipdb():
    key = os.environ.get("ABUSEIPDB_API_KEY")
    if not key:
        return []
    try:
        r = await httpx.AsyncClient().get(
            "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=75",
            headers={"Key": key, "Accept": "application/json"}, timeout=30
        )
        if r.status_code != 200:
            return []
        data = r.json()
        rows = []
        for e in data.get("data", []):
            rows.append({
                "type": "ip", "value": e.get("ipAddress", ""), "source": "abuseipdb",
                "first_seen": now_ts(), "last_seen": now_ts(),
                "severity": 3 if e.get("abuseConfidenceScore", 0) >= 90 else 2,
                "tags": json.dumps(["abuseipdb_blacklist"]),
                "geo": json.dumps({"country": e.get("countryCode")}) if e.get("countryCode") else None,
                "asn": e.get("asn"), "abuse_score": e.get("abuseConfidenceScore"), "metadata": json.dumps({})
            })
        return rows
    except Exception:
        return []

async def collect_openphish():
    try:
        r = await httpx.AsyncClient().get("https://openphish.com/feed.txt", timeout=30)
        if r.status_code != 200:
            return []
        rows = []
        for line in r.text.strip().splitlines():
            url = line.strip()
            if not url:
                continue
            rows.append({
                "type": "url", "value": url, "source": "openphish",
                "first_seen": now_ts(), "last_seen": now_ts(),
                "severity": 2, "tags": json.dumps(["phishing"]), "geo": None, "asn": None, "abuse_score": None, "metadata": json.dumps({})
            })
        return rows
    except Exception:
        return []

async def run_all_collectors():
    from db import get_conn, upsert_indicator
    conn = await get_conn()
    for rows in [await collect_abuseipdb(), await collect_openphish()]:
        for row in rows:
            await upsert_indicator(conn, row)
    await conn.commit()
    await conn.close()
