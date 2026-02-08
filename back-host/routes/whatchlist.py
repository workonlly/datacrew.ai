from fastapi import APIRouter, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.database import get_db
from fastapi import Depends
import json

router = APIRouter()

router.get("/embed/{mask_id}")
def serve_widget(mask_id: int, db: Session = Depends(get_db)):
    """
    This is the Public API Endpoint.
    It returns raw HTML to be loaded inside an iframe 'src'.
    """
    # 1. Get the latest successful job for this mask
    query = text("""
        SELECT result 
        FROM ai_jobs 
        WHERE mask_id = :mid AND status = 'completed' 
        ORDER BY updated_at DESC 
        LIMIT 1
    """)
    job = db.execute(query, {"mid": mask_id}).fetchone()

    # 2. Fallback HTML if processing or failed
    if not job:
        html_fallback = """
        <html>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc;">
                <div style="text-align: center; color: #64748b;">
                    <h2>Widget Generating...</h2>
                    <p>Please check back in a moment.</p>
                </div>
                <script>setTimeout(function(){ location.reload(); }, 5000);</script>
            </body>
        </html>
        """
        return Response(content=html_fallback, media_type="text/html")

    # 3. Extract and Serve the AI HTML
    try:
        data = job.result if isinstance(job.result, dict) else json.loads(job.result)
        html_content = data.get("html_code", "<h1>Error: Invalid Data</h1>")
        
        # Add a base target so links open in new tabs (optional but recommended for iframes)
        if "<head>" in html_content:
            html_content = html_content.replace("<head>", "<head><base target='_blank'>")
            
        return Response(content=html_content, media_type="text/html")
        
    except Exception as e:
        return Response(content=f"<h1>System Error</h1><p>{str(e)}</p>", media_type="text/html")
