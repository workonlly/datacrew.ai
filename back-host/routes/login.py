from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.database import get_db
import bcrypt

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/signup/")
def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1️⃣ Check if username/email exists
    check_query = text("SELECT id FROM users WHERE username = :u OR email = :e")
    existing_user = db.execute(check_query, {"u": username, "e": email}).fetchone()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # 2️⃣ Hash the password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        # 3️⃣ Insert new user
        insert_user_query = text("""
            INSERT INTO users (username, email, password_hash)
            VALUES (:u, :e, :p)
            RETURNING id, username, email, created_at
        """)
        new_user = db.execute(insert_user_query, {
            "u": username, 
            "e": email, 
            "p": password_hash
        }).fetchone()
        
        # 4️⃣ Insert the default mask
        # Since api_key is NULL (optional) in your new table, we don't need to pass it.
        # It will default to NULL automatically.
        if new_user:
            insert_mask_query = text("""
                INSERT INTO masks (user_id, mask_name) 
                VALUES (:uid, :mname)
            """)
            db.execute(insert_mask_query, {
                "uid": new_user.id, 
                "mname": "Default Mask"
            })

        # 5️⃣ Commit EVERYTHING at once
        # This guarantees that you never have a User without a Mask.
        db.commit()
        
        return dict(new_user._mapping)

    except Exception as e:
        db.rollback() # Undo the user insert if the mask insert fails
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login/")
def login_user(
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # 1. Find the user by Username
    query = text("SELECT id, username, password_hash FROM users WHERE username = :u")
    user = db.execute(query, {"u": username}).fetchone()

    # 2. If user doesn't exist
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    # 3. Verify the Password
    # Convert the row to a dictionary to access fields safely
    user_dict = user._mapping
    stored_hash = user_dict["password_hash"]
    
    # bcrypt.checkpw requires bytes, so we encode the input password and the stored hash
    if not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    # 4. Success! Return the User ID (and eventually a JWT token)
    return {
        "message": "Login successful", 
        "user_id": str(user_dict["id"]),
        "username": user_dict["username"]
    }

@router.get("/profile/")
def get_profile(
    user_id: str,  # <--- FastAPI looks for ?user_id=... automatically
    db: Session = Depends(get_db)
):
    query = text("SELECT username FROM users WHERE id = :id")
    user = db.execute(query, {"id": user_id}).fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return dict(user._mapping)