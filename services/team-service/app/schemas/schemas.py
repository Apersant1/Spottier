from datetime import datetime
from typing import List
from pydantic import BaseModel,Field,UUID4



class TeamBase(BaseModel):
    """
        Base team model fro validate data
    """
    
    name: str = Field(...,min_length=4,max_length=8)
    desc: str = Field(...,max_length=30)
    
    class Config:
        from_attributes = True

class TeamCreate(TeamBase):
    ...

class TeamRead(BaseModel):
    id: UUID4
    name: str
    desc: str 
    member_count: int
    members: List[UUID4]
    created_at : datetime

class TeamUpdate(TeamBase):
    ...