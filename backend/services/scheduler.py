"""Run OSINT collectors on a schedule."""
import asyncio
import logging
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)
_scheduler = None

def _run_collectors():
    try:
        from services.collectors import run_all_collectors
        asyncio.run(run_all_collectors())
        logger.info("Collectors run completed")
    except Exception as e:
        logger.exception("Collectors run failed: %s", e)

def start_scheduler():
    global _scheduler
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(_run_collectors, "interval", minutes=15, id="osint")
    _scheduler.start()
    _run_collectors()

def stop_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown()
        _scheduler = None
