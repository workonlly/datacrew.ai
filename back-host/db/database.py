from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "cockroachdb://root@localhost:26257/defaultdb?sslmode=disable"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()