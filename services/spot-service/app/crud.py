import typing
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


def get_all_spot(db: Session) -> typing.List[Spot]:
    return db.query(Spot).all()


def get_spot(spotId: uuid.UUID, db: Session) -> Spot:
    return db.query(Spot).filter(Spot.id == spotId).first()


def update_spot_fields(spotId: uuid.UUID, spot: SpotUpdate, db: Session) -> SpotUpdate:
    '''
    Обновляет информацию о площадке
    '''
    result = db.query(Spot) \
        .filter(Spot.id == spotId) \
        .update(spot.dict())
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
