from celery_config import celery_app
from sqlalchemy import text
from db.database import SessionLocal
from ai_system.crew import run_crewai_process
import re
import json

def extract_html(ai_string):
    """Safely extracts HTML from markdown backticks."""
    match = re.search(r'```html\s*(.*?)\s*```', ai_string, re.DOTALL)
    return match.group(1).strip() if match else ai_string.strip()

@celery_app.task(name="run_mask_processing")
def run_mask_processing(job_id, title, description, urls):
    db = SessionLocal()
    try:
        # 1. Execute CrewAI
        ai_result = run_crewai_process(title, description, urls, "104.214.172.38")

        # 2. Extract and sanitize the code
        # We use .raw to get the final agent output
        raw_html = extract_html(ai_result.raw)

        # 3. Store as a structured JSON object
        # This prevents the 'invalid JSON' error in CockroachDB
        final_payload = json.dumps({"html_code": raw_html})

        db.execute(
            text("UPDATE ai_jobs SET status = 'completed', result = :res, updated_at = NOW() WHERE id = :jid"),
            {"res": final_payload, "jid": job_id}
        )
        db.commit()

    except Exception as e:
        db.rollback() # 👈 Prevents the "transaction aborted" lock
        db.execute(
            text("UPDATE ai_jobs SET status = 'failed', error_message = :err, updated_at = NOW() WHERE id = :jid"),
            {"err": str(e), "jid": job_id}
        )
        db.commit()
    finally:
        db.close()