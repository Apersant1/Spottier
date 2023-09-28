from pydantic import BaseModel, Field, UUID4
from typing import Optional


class SpotBase(BaseModel):
    """
        Basic schemas for spot views
    """
    name: str = Field(title='Name of sport playground',
                      max_length=40)
    desc: str = Field(title='Description about place',
                      max_length=300)
    lat: float
    lon: float
    country: str
    sport_type: Optional[str]

    class Config:
        from_attributes = True


class SpotRead(SpotBase):
    id: UUID4


class SpotCreate(SpotBase):
    name: str
    desc: str
    lat: float
    lon: float
    country: str
    sport_type: Optional[str]


class SpotUpdate(SpotBase):
    name: str
    desc: str
    lat: float
    lon: float
    country: str
    sport_type: Optional[str]


class SpotDelete(SpotBase):
    ...
