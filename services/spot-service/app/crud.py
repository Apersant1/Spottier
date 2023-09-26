import uuid
from .models import Spot
from sqlalchemy.orm import Session
from .schemas import SpotCreate, SpotBase, SpotDelete, SpotUpdate


def create_spot(db: Session, spot: SpotCreate) -> SpotCreate:
    """ Create spot
    :rtype: SpotCreate
    """
    db_spot = Spot(
        id=uuid.uuid4(),  # Generate a UUID for the id
        name=spot.name,
        desc=spot.desc,
        lat=spot.lat,
        lon=spot.lon,
        country=spot.country,
        sport_type=spot.sport_type,
        wkb_geometry=f'POINT({spot.lat} {spot.lon})'
    )
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    return db_spot
