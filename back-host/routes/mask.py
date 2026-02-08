from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from db.database import get_db

router = APIRouter(prefix="/masks", tags=["masks"])

# 1️⃣ READ ALL (Get Every Column)


@router.get("/")
def get_masks(db: Session = Depends(get_db)):
    # We fetch EVERYTHING so you can use this data anywhere
    query = text("""
        SELECT 
            id, 
            user_id, 
            mask_name, 
            api_key, 
            title, 
            description, 
            site_url, 
            created_at 
        FROM masks 
        ORDER BY created_at DESC
    """)
    results = db.execute(query).fetchall()
    
    return [
        {
            "id": str(row.id),          # 🟢 FIX: Convert to string for frontend
            "user_id": str(row.user_id), # 🟢 FIX: Convert to string for frontend
            "mask_name": row.mask_name,
            "api_key": row.api_key,
            "title": row.title,
            "description": row.description,
            "site_url": row.site_url,
            "created_at": row.created_at
        } 
        for row in results
    ]

# 2️⃣ CREATE (Supports All Columns)
@router.post("/add/")
def add_mask(
    mask_name: str = Form(...),
    user_id: int = Form(...), # Python handles large ints fine on input
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None), 
    db: Session = Depends(get_db)
):
    try:
        # We insert defaults. site_url starts as empty array if not provided.
        insert_query = text("""
            INSERT INTO masks (user_id, mask_name, title, description, api_key, site_url)
            VALUES (:uid, :nm, :ti, :desc, :key, :urls)
            RETURNING *
        """)
        
        new_mask = db.execute(insert_query, {
            "uid": user_id, 
            "nm": mask_name, 
            "ti": title,
            "desc": description,
            "key": api_key,
            "urls": [] # Default empty list for site_url
        }).fetchone()
        
        db.commit()
        
        # 🟢 FIX: Convert IDs to string in response
        result = dict(new_mask._mapping)
        result["id"] = str(result["id"])
        result["user_id"] = str(result["user_id"])
        
        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 3️⃣ UPDATE (Edit Any Column)
@router.put("/update/{mask_id}")
def update_mask(
    mask_id: int, # Python handles large ints fine on input
    mask_name:Optional [str] = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # Check if exists
    if not db.execute(text("SELECT id FROM masks WHERE id = :id"), {"id": mask_id}).fetchone():
        raise HTTPException(status_code=404, detail="Mask not found")

    try:
        update_query = text("""
            UPDATE masks 
            SET mask_name = :nm, 
                title = :ti, 
                description = :desc, 
                api_key = :key
            WHERE id = :id
            RETURNING *
        """)
        
        updated_mask = db.execute(update_query, {
            "nm": mask_name, 
            "ti": title, 
            "desc": description, 
            "key": api_key,
            "id": mask_id
        }).fetchone()
        
        db.commit()

        # 🟢 FIX: Convert IDs to string in response
        result = dict(updated_mask._mapping)
        result["id"] = str(result["id"])
        result["user_id"] = str(result["user_id"])
        
        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 4️⃣ DELETE
@router.delete("/delete/{mask_id}")
def delete_mask(mask_id: int, db: Session = Depends(get_db)):
    # Check if exists
    if not db.execute(text("SELECT id FROM masks WHERE id = :id"), {"id": mask_id}).fetchone():
        raise HTTPException(status_code=404, detail="Mask not found")

    try:
        db.execute(text("DELETE FROM masks WHERE id = :id"), {"id": mask_id})
        db.commit()
        # 🟢 FIX: Return ID as string
        return {"message": "Mask deleted successfully", "id": str(mask_id)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))