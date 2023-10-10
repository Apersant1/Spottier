from typing import Optional,Union
import datetime
from pydantic import BaseModel, Field, UUID4
import pytz


class Match(BaseModel):
    """
        Basic match schema
    """
    spot_id: UUID4
    duration: int 
    team_first_id: Optional[Union[UUID4,None]] = None
    team_first_score: int 
    team_second_id: Optional[Union[UUID4,None]] = None
    team_second_score: int 
    visible: bool
    

    class Config:
        from_attributes = True


class MatchRead(Match):
    id : UUID4
    registered_at : datetime.datetime = Field(default_factory=lambda: pytz.timezone('UTC+3').localize(datetime.datetime.utcnow()))

class MatchCreate(Match):
    ...