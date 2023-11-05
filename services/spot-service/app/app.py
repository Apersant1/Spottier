import typing
import uuid
import logging
import logging_loki
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse,HTMLResponse
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator
from .schemas import SpotCreate
from . import crud
from . import config 

from .database import DB_INITIALIZER
from .schemas import SpotBase, SpotCreate, SpotDelete, SpotUpdate, SpotRead

cfg: config.Config = config.load_config()

SpotHandler = logging_loki.LokiHandler(
    url=cfg.loki_dsn,
    tags={"application": "Spot-service"},
    version="1",
)

logger = logging.getLogger("SpotService")
logger.setLevel(logging.INFO)
logger.addHandler(SpotHandler)

# connect to DB
SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))


logger.info(
    "Create session", 
    extra={"tags": {"service": "Spot-service"}},
)

# init app
app = FastAPI(
    version="0.0.1",
    title="Spot-service"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

Instrumentator().instrument(app).expose(app)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# endpoints


@app.post("/spots", tags=["spots"],status_code=201, response_model=SpotRead, summary="Add new playground in App")
async def add_spot(spot: SpotCreate, db: Session = Depends(get_db)) -> SpotCreate:
  
    return crud.create_spot(db=db, spot=spot)


@app.get("/spots", tags=["spots"],status_code=200, response_model=list[SpotRead], summary="Get all spots from db")
async def get_all_spots(db: Session = Depends(get_db)) -> typing.List[SpotRead]:
    all_spots = crud.get_all_spot(db=db)
    if all_spots is not None:
        return all_spots
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
            content={"Error":"Spots not found"})


@app.get("/spots/{spotId}",tags=["spots"], status_code=200, response_model=SpotRead, summary="Get spots one spot by id from db")
async def get_spot_by_id(spotId: uuid.UUID, db: Session = Depends(get_db)) -> SpotRead:
    db_spot = crud.get_spot(spotId=spotId, db=db)
    if db_spot is not None:
        return db_spot
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Spot not found"})


@app.patch("/spots/{spotId}",tags=["spots"], status_code=201, response_model=SpotRead, summary="Update spot info")
async def update_spot(spotId: uuid.UUID, spot: SpotUpdate, db: Session = Depends(get_db)) -> SpotUpdate:
    update_spot = crud.update_spot_fields(spotId=spotId, spot=spot, db=db)
    if update_spot is not None:
        return update_spot
    return JSONResponse(status_code=404, content={"message": "Spot not found"})


@app.delete("/spots/{spotId}", tags=["spots"],status_code=201, response_model=SpotDelete, summary="Remove spot from db")
async def delete_spot(spotId: uuid.UUID, db: Session = Depends(get_db)) -> SpotDelete:
    if crud.delete_spot(spotId, db):
        return JSONResponse(status_code=200, content={"message": "Spot successfully deleted"})
    return JSONResponse(status_code=404, content={"message": "Spot not found"})


@app.get("/visualize" ,tags=["geo"])
async def visualize_data(db: Session = Depends(get_db)):
    return crud.visualize_on_map(db=db)

@app.get("/map",tags=["geo"])
async def show_map():
    return HTMLResponse(content=open("map.html").read(), status_code=200)

@app.get("/points_within_radius",tags=["geo"], status_code=201, summary="Get dict spots around spot")
async def get_spots_radius(latitude: float, longitude: float,\
     radius: float,db:Session = Depends(get_db)):
    
    return crud.get_points_within_radius(latitude=latitude,longitude=longitude,radius=radius,db=db)

@app.get("/nearest",tags=["geo"], status_code=201, summary="Find neares Spot around point")
async def get_nearest_point(latitude: float, longitude: float,db:Session = Depends(get_db)):
    
    return crud.find_nearest(latitude=latitude,longitude=longitude,db=db)