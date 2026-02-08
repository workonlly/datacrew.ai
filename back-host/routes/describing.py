from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional # 👈 Added imports for type hinting
from db.database import get_db
from ai_system.worker import run_mask_processing

router = APIRouter(prefix="/describing", tags=["describing"])

# 1️⃣ GET SINGLE MASK
@router.get("/{mask_id}")
def get_mask(mask_id: int, db: Session = Depends(get_db)):
    query = text("SELECT * FROM masks WHERE id = :id")
    result = db.execute(query, {"id": mask_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Mask not found")

    return {
        "id": str(result.id),
        "user_id": str(result.user_id),
        "title": result.title,              
        "description": result.description,
        "site_url": result.site_url if result.site_url is not None else [],
        "created_at": result.created_at
    }

@router.put("/update/{mask_id}")
def update_mask(
    mask_id: int,
    api_keys: List[str] = Form([]), 
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    site_url: List[str] = Form([]), 
    db: Session = Depends(get_db)
):
    # 1. Check existence and get user_id
    mask_check = db.execute(
        text("SELECT user_id FROM masks WHERE id = :id"), 
        {"id": mask_id}
    ).fetchone()
    
    if not mask_check:
        raise HTTPException(status_code=404, detail="Mask not found")

    try:
        # 2. Update Mask and return values
        query = text("""
            UPDATE masks 
            SET title = :ti, api_key = :key, description = :desc, site_url = :urls
            WHERE id = :id
            RETURNING id, user_id, title
        """)
        
        result = db.execute(query, {
            "ti": title, "key": api_keys, "desc": description, "urls": site_url, "id": mask_id
        }).fetchone()

        # 3. Create the AI Job record
        # Note: we use 'initializing' as a placeholder for task_id
        insert_job_query = text("""
            INSERT INTO ai_jobs (user_id, mask_id, task_id, status)
            VALUES (:uid, :mid, 'initializing', 'pending')
            RETURNING id
        """)
        
        job_row = db.execute(insert_job_query, {
            "uid": mask_check.user_id, 
            "mid": mask_id
        }).fetchone()
        
        # Capture IDs as variables
        job_id = job_row.id

        # 4. Trigger Celery (passing IDs as ints is fine for Python)
        
        celery_task = run_mask_processing.delay(
            job_id=job_id,
            title=title,
            description=description,
            urls=site_url
        )

        # 5. Update with real Celery Task ID (Task ID is a string already)
        db.execute(
            text("UPDATE ai_jobs SET task_id = :tid WHERE id = :jid"),
            {"tid": celery_task.id, "jid": job_id}
        )
        
        db.commit()

        # 6. RETURN EVERYTHING AS STRINGS to prevent rounding in JS
        return {
            "status": "Job Triggered",
            "job_id": str(job_id), 
            "celery_task_id": str(celery_task.id),
            "mask_details": {
                "id": str(result.id),
                "user_id": str(result.user_id),
                "title": result.title
            }
        }

    except Exception as e:
        db.rollback()
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail=f"Flow failed: {str(e)}")