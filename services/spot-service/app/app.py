import typing
import uuid
from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from .schemas import SpotCreate
from . import crud
from .config import DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER

from .database import DB_INITIALIZER
from .schemas import SpotBase, SpotCreate, SpotDelete, SpotUpdate, SpotRead


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


@app.post("/spots", status_code=201, response_model=SpotCreate, summary="Add new playground in App")
async def add_spot(spot: SpotCreate, db: Session = Depends(get_db)) -> SpotCreate:
    return crud.create_spot(db=db, spot=spot)


@app.get("/spots", status_code=201, response_model=list[SpotRead], summary="Get all spots from db")
async def get_all_spots(db: Session = Depends(get_db)) -> typing.List[SpotRead]:
    return crud.get_all_spot(db=db)


@app.get("/spots/{spotId}", status_code=201, response_model=SpotBase, summary="Get spots one spot by id from db")
async def get_spot_by_id(spotId: uuid.UUID, db: Session = Depends(get_db)) -> SpotBase:
    return crud.get_spot(spotId=spotId, db=db)


@app.patch("/spots/{spotId}", status_code=201, response_model=SpotUpdate, summary="Update spot info")
async def update_spot(spotId: uuid.UUID, spot: SpotUpdate, db: Session = Depends(get_db)) -> SpotUpdate:
    update_spot = crud.update_spot_fields(spotId=spotId, spot=spot, db=db)
    if update_spot != None:
        return update_spot
    return JSONResponse(status_code=404, content={"message": "Item not found"})


@app.delete("/spots/{spotId}", status_code=201, response_model=SpotDelete, summary="Remove spot from db")
async def delete_spot(spotId: uuid.UUID, db: Session = Depends(get_db)) -> SpotDelete:
    if crud.delete_spot(spotId, db):
        return JSONResponse(status_code=200, content={"message": "Item successfully deleted"})
    return JSONResponse(status_code=404, content={"message": "Item not found"})
