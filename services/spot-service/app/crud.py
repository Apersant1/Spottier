import typing
import uuid
from fastapi.responses import RedirectResponse,JSONResponse
from sqlalchemy.orm import Session
from shapely.geometry import Point
from geoalchemy2 import WKTElement
from geoalchemy2.shape import to_shape
import folium
from .models import Spot
from .schemas import SpotCreate, SpotBase, SpotDelete, SpotUpdate


def create_spot(db: Session, spot: SpotCreate) -> SpotCreate:
    """ Create spot
    :rtype: SpotCreate
    """
    shapely_point = Point(spot.lat, spot.lon)
    wkt_point = WKTElement(shapely_point.wkt, srid=4326)


    db_spot = Spot(
        id=uuid.uuid4(),  # Generate a UUID for the id
        name=spot.name,
        desc=spot.desc,
        lat=spot.lat,
        lon=spot.lon,
        country=spot.country,
        sport_type=spot.sport_type,
        wkb_geometry=wkt_point
    )
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    return db_spot


def get_all_spot(db: Session) -> typing.List[Spot]:
    """
    Retrieve all Spots from the database.

    Parameters:
    - db (Session): The database session.

    Returns:
    - List[Spot]: A list of Spot objects representing all spots in the database.
    """
    return db.query(Spot).all()


def get_spot(spotId: uuid.UUID, db: Session) -> Spot:
    """
    Retrieve Spot by id from the database.
    
    Parameters:
    - spotId (UUID): Identificator Spot in databse
    - db (Session): The database session.
    
    Returns:
    - Spot: A Spot object representing Spot by id in the database.
    """
    return db.query(Spot).filter(Spot.id == spotId).first()


def update_spot_fields(spotId: uuid.UUID, spot: SpotUpdate, db: Session) -> SpotUpdate:
    """
    Update spot by id from the database.
    
    Parameters:
    - spotId (UUID): Identificator Spot in databse
    - db (Session): The database session.
    
    Returns:
    - SpotUpdate: A Spot object updating Spot by id in the database.
    """
    result = db.query(Spot) \
        .filter(Spot.id == spotId) \
        .update(spot.dict())
    db.commit()

    if result == 1:
        return get_spot(spotId, db)
    return None


def delete_spot(spotId: uuid.UUID, db: Session) -> SpotDelete:
    """
    Delete spot by id from the database.
    
    Parameters:
    - spotId (UUID): Identificator Spot in databse
    - db (Session): The database session.
    
    Returns:
    - SpotDelete: A Spot object updating Spot by id in the database.
    """
    result = db.query(Spot)\
        .filter(Spot.id == spotId)\
        .delete()
    db.commit()
    return result == 1


def visualize_on_map(db:Session):
    """
    visualizing all spot from the database.
    
    Parameters:
    - db (Session): The database session.
    
    Returns:
    - RedirectResponse: HTML document with map.
    """
    geo_data = db.query(Spot).all()
    map = folium.Map(location=[0, 0], zoom_start=2)

    for point in geo_data:
        shapely_point = to_shape(point.wkb_geometry)
        latitude = shapely_point.x
        longitude = shapely_point.y
        folium.Marker([latitude, longitude]).add_to(map)
    map.save("map.html")
    return RedirectResponse(url="/map")

def get_points_within_radius(latitude: float, longitude: float, radius: float,db:Session):
    """
    Retrieve points within a given radius from the specified latitude and longitude.

    Parameters:
    - latitude (float): The latitude of the center point.
    - longitude (float): The longitude of the center point.
    - radius (float): The radius in meters.
    - db (Session): The database session.

    Returns:
    - JSONResponse: A response containing the points found within the given radius.

    Raises:
    - JSONResponse: If no points are found within the given radius.
    """
    shapely_point = Point(longitude, latitude)
    wkt_point = WKTElement(shapely_point.wkt, srid=4326)
    points = db.query(Spot).filter(Spot.wkb_geometry.distance_centroid(wkt_point) <= radius).all()
    
    if not points:
        return JSONResponse(status_code=404, content={"message":"No points found within the given radius"})
    
    result = []
    
    for point in points:
        shapely_point = to_shape(point.wkb_geometry)
        result.append({"name":point.name, "latitude": shapely_point.x, "longitude": shapely_point.y})
    
    return JSONResponse(status_code=201,content={"points": result})