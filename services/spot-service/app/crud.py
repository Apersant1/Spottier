import typing
import uuid
from fastapi.responses import RedirectResponse,JSONResponse
from sqlalchemy.orm import Session
from shapely.geometry import Point
from geoalchemy2 import WKTElement
from geoalchemy2.shape import to_shape
from geoalchemy2 import functions as geofunc
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

    return db.query(Spot).all()


def get_spot(spotId: uuid.UUID, db: Session) -> Spot:

    return db.query(Spot).filter(Spot.id == spotId).first()


def update_spot_fields(spotId: uuid.UUID, spot: SpotUpdate, db: Session) -> SpotUpdate:

    shapely_point = Point(spot.lat, spot.lon)
    wkt_point = WKTElement(shapely_point.wkt, srid=4326)

    result = db.query(Spot) \
        .filter(Spot.id == spotId) \
        .update({
            Spot.name : spot.name,
            Spot.desc : spot.desc,
            Spot.lat: spot.lat,
            Spot.lon :spot.lon,
            Spot.sport_type: spot.sport_type,
            Spot.wkb_geometry : wkt_point
        })
    db.commit()

    if result == 1:
        return get_spot(spotId, db)
    return None


def delete_spot(spotId: uuid.UUID, db: Session) -> SpotDelete:
    result = db.query(Spot)\
        .filter(Spot.id == spotId)\
        .delete()
    db.commit()
    return result == 1


def visualize_on_map(db:Session):
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

def find_nearest(latitude: float, longitude: float,db:Session):

    shapely_point = Point(longitude, latitude)
    wkt_point = WKTElement(shapely_point.wkt, srid=4326)
    nearest = db.query(Spot)\
        .order_by(geofunc.ST_Distance(Spot.wkb_geometry, wkt_point))\
        .first()
    if not nearest:
        return JSONResponse(status_code=404, content={"message": "No nearest point found"})

    shapely_point = to_shape(nearest.wkb_geometry)

    return JSONResponse(status_code=201,\
         content={"name": nearest.name, "x": shapely_point.x, "y": shapely_point.y})