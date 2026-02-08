# routes/render.py (Add to your FastAPI app)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.database import get_db
import json

router = APIRouter()

@router.get("/jobs/by-mask/{mask_id}")
def get_job_by_mask(mask_id: int, db: Session = Depends(get_db)):
    # Fetch the latest completed job for this mask_id
    query = text("""
        SELECT result 
        FROM ai_jobs 
        WHERE mask_id = :mid AND status = 'completed' 
        ORDER BY updated_at DESC 
        LIMIT 1
    """)
    job = db.execute(query, {"mid": mask_id}).fetchone()

    if not job:
        raise HTTPException(status_code=404, detail="No completed job found for this mask")

    # Return the result JSON directly
    return job.result if isinstance(job.result, dict) else json.loads(job.result)