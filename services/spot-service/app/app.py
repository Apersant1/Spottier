from fastapi import FastAPI, Depends

from sqlalchemy.orm import Session
from .schemas import SpotCreate
from . import crud
from .config import DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER

from .database import DB_INITIALIZER
from .schemas import SpotBase, SpotCreate, SpotDelete, SpotUpdate


# connect to DB
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SessionLocal = DB_INITIALIZER.init_database(DATABASE_URL)


# init app
app = FastAPI(
    version="0.0.1",
    title="Spot-service"
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# endpoints


@app.post("/spots", status_code=200, response_model=SpotBase, summary="Add new playground in App")
async def add_spot(spot: SpotBase, db: Session = Depends(get_db)) -> SpotBase:
    return crud.create_spot(db=db, spot=spot)
