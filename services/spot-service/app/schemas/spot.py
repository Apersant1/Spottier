import uuid
from datetime import datetime
from pydantic import BaseModel, Field, Json
from typing import Optional, Dict


class SpotBase(BaseModel):
    """
        Basic schemas for spot views
    """
    name: str = Field(..., title='Name of sport playground', max_length=40, example="string")
    desc: str = Field(..., title='Description about place', max_length=300, example="string")
    position: Dict  = Field(...)
    registered_at: datetime = Field(...)

    class Config:
        from_attributes = True

class SpotRead(SpotBase):
    ...


class SpotCreate(SpotBase):
    ...

class SpotUpdate(SpotBase):
    name: str = Field(title='Name of sport playground', max_length=40)
    desc: Optional[str] = Field(title='Description about place', max_length=300)
    position: Json = Field()

class SpotDelete(SpotBase):
    ...
