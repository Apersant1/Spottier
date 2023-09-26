from datetime import datetime
from sqlalchemy import Column, String,  UUID, Float
from geoalchemy2 import Geometry
from ..database import Base


class Spot(Base):
    __tablename__ = "spots"
    id = Column("id", UUID, primary_key=True, index=True)
    name = Column("name", String, nullable=False)
    desc = Column("desc", String)
    lat = Column(Float)
    lon = Column(Float)
    country = Column(String)
    sport_type = Column("sport_type", String)
    wkb_geometry = Column(Geometry("POINT", srid=4326))
