import typing
import uuid
from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse,HTMLResponse
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator
from .schemas import SpotCreate
from . import crud
from . import config 

from .database import DB_INITIALIZER
from .schemas import SpotBase, SpotCreate, SpotDelete, SpotUpdate, SpotRead

cfg: config.Config = config.load_config()

# connect to DB
SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))


# init app
app = FastAPI(
    version="0.0.1",
    title="Spot-service"
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
    """
    Create a new spot with the given information.

    Parameters:
    - name (str): The name of the spot.
    - desc (str): The description of the spot.
    - lat (float): The latitude of the spot.
    - lon (float): The longitude of the spot.
    - country (str): The country of the spot.
    - sport_type (str): The type of sport available at the spot.

    Returns:
    - JSONResponse: A response indicating the success or failure of the spot creation.
    """
    return crud.create_spot(db=db, spot=spot)


@app.get("/spots", tags=["spots"],status_code=201, response_model=list[SpotRead], summary="Get all spots from db")
async def get_all_spots(db: Session = Depends(get_db)) -> typing.List[SpotRead]:
    """
    Retrieve all Spots from the database.

    Returns:
    - List[Spot]: A list of Spot objects representing all spots in the database.
    """
    return crud.get_all_spot(db=db)


@app.get("/spots/{spotId}",tags=["spots"], status_code=201, response_model=SpotRead, summary="Get spots one spot by id from db")
async def get_spot_by_id(spotId: uuid.UUID,\
     db: Session = Depends(get_db)) -> SpotRead:
    """
    Retrieve Spot by id from the database.
    
    Parameters:
    - spotId (UUID): Identificator Spot in databse
    
    Returns:
    - Spot: A Spot object representing Spot by id in the database.
    """
    return crud.get_spot(spotId=spotId, db=db)


@app.patch("/spots/{spotId}",tags=["spots"], status_code=201, response_model=SpotRead, summary="Update spot info")
async def update_spot(spotId: uuid.UUID, \
    spot: SpotUpdate, db: Session = Depends(get_db)) -> SpotUpdate:
    """
    Update spot by id from the database.
    
    Parameters:
    - spotId (UUID): Identificator Spot in databse

    
    Returns:
    - SpotUpdate: A Spot object updating Spot by id in the database.
    """
    update_spot = crud.update_spot_fields(spotId=spotId, spot=spot, db=db)
    if update_spot != None:
        return update_spot
    return JSONResponse(status_code=404, content={"message": "Item not found"})


@app.delete("/spots/{spotId}", tags=["spots"],status_code=201, response_model=SpotDelete, summary="Remove spot from db")
async def delete_spot(spotId: uuid.UUID, db: Session = Depends(get_db)) -> SpotDelete:
    """
    Delete spot by id from the database.
    
    Parameters:
    - spotId (UUID): Identificator Spot in databse
    
    Returns:
    - SpotDelete: A Spot object updating Spot by id in the database.
    """
    if crud.delete_spot(spotId, db):
        return JSONResponse(status_code=200, content={"message": "Item successfully deleted"})
    return JSONResponse(status_code=404, content={"message": "Item not found"})


@app.get("/visualize" ,tags=["geo"])
async def visualize_data(db: Session = Depends(get_db)):
    """
    visualizing all spot from the database.
    
    Parameters:
    - db (Session): The database session.
    
    Returns:
    - RedirectResponse: HTML document with map.
    """
    return crud.visualize_on_map(db=db)

@app.get("/map",tags=["geo"])
async def show_map():
    """
    Open map  
    
    Returns:
    - HTMLResponse: HTML document with map.
    """
    return HTMLResponse(content=open("map.html").read(), status_code=200)

@app.get("/points_within_radius",tags=["geo"], status_code=201, summary="Get dict spots around spot")
async def get_spots_radius(latitude: float, longitude: float,\
     radius: float,db:Session = Depends(get_db)):
    """
    Get the points within a given radius from a specified latitude and longitude.

    Parameters:
    - latitude (float): The latitude of the center point.
    - longitude (float): The longitude of the center point.
    - radius (float): The radius in kilometers (km) within which to search for points.

    Returns:
    - JSONResponse: A response containing the points found within the given radius.

    """
    return crud.get_points_within_radius(latitude=latitude,longitude=longitude,radius=radius,db=db)

@app.get("/nearest",tags=["geo"], status_code=201, summary="Find neares Spot around point")
async def get_nearest_point(latitude: float, longitude: float,db:Session = Depends(get_db)):
    """
    Find the nearest Spot to the given latitude and longitude.

    Args:
        latitude (float): The latitude coordinate.
        longitude (float): The longitude coordinate.

    Returns:
        JSONResponse: The JSON response containing the name, x, and y coordinates of the nearest spot.
    """
    return crud.find_nearest(latitude=latitude,longitude=longitude,db=db)