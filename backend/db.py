"""SQLite database and indicators schema."""
import os
import aiosqlite
from pathlib import Path

DB_PATH = os.environ.get("DB_PATH", "data/threat_intel.db")
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

async def get_conn():
    return await aiosqlite.connect(DB_PATH)

async def init_db():
    conn = await get_conn()
    await conn.executescript("""
        CREATE TABLE IF NOT EXISTS indicators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            value TEXT NOT NULL,
            source TEXT NOT NULL,
            first_seen TEXT NOT NULL,
            last_seen TEXT NOT NULL,
            severity INTEGER,
            tags TEXT,
            geo TEXT,
            asn INTEGER,
            abuse_score INTEGER,
            metadata TEXT,
            UNIQUE(type, value, source)
        );
        CREATE INDEX IF NOT EXISTS idx_indicators_last ON indicators(last_seen);
        CREATE INDEX IF NOT EXISTS idx_indicators_type ON indicators(type);
    """)
    await conn.commit()
    await conn.close()

async def upsert_indicator(conn, row):
    await conn.execute("""
        INSERT INTO indicators (type, value, source, first_seen, last_seen, severity, tags, geo, asn, abuse_score, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(type, value, source) DO UPDATE SET
            last_seen=excluded.last_seen, severity=excluded.severity, tags=excluded.tags,
            geo=excluded.geo, asn=excluded.asn, abuse_score=excluded.abuse_score, metadata=excluded.metadata
    """, (
        row["type"], row["value"], row["source"], row["first_seen"], row["last_seen"],
        row.get("severity"), row.get("tags"), row.get("geo"), row.get("asn"), row.get("abuse_score"), row.get("metadata")
    ))

async def get_latest_indicators(limit=50, offset=0):
    conn = await get_conn()
    conn.row_factory = aiosqlite.Row
    cur = await conn.execute(
        "SELECT * FROM indicators ORDER BY last_seen DESC LIMIT ? OFFSET ?", (limit, offset)
    )
    rows = await cur.fetchall()
    await conn.close()
    return [dict(r) for r in rows]

async def get_map_buckets():
    conn = await get_conn()
    cur = await conn.execute("""
        SELECT json_extract(geo, '$.country') AS country, COUNT(*) AS count
        FROM indicators WHERE geo IS NOT NULL
        GROUP BY country ORDER BY count DESC
    """)
    rows = await cur.fetchall()
    await conn.close()
    return [{"country": r[0], "count": r[1]} for r in rows]
