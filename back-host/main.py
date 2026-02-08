from fastapi import FastAPI
from routes import login 
from fastapi.middleware.cors import CORSMiddleware
from routes import mask
from routes import describing
from routes import whatchlist
from routes import live
app = FastAPI()
app.include_router(login.router)
app.include_router(mask.router)
app.include_router(describing.router)
app.include_router(whatchlist.router)
app.include_router(live.router)


origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

# 3. Add the Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,      
    allow_methods=["*"],         
    allow_headers=["*"],  
)

@app.get("/")
async def read_root():
     sam="hello from back-host"
     return sam