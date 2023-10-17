from datetime import datetime
from sqlalchemy import Column,String,TIMESTAMP,Integer
from sqlalchemy.dialects.postgresql import UUID,ARRAY
from typing import List

from ..database import Base

class Team(Base):
    __tablename__ = "teams"
    id = Column("id",UUID,primary_key=True,index=True)
    name = Column("name",String)
    desc = Column("desc",String)
    member_count = Column("member_count",Integer,default=0)
    members = Column("members", ARRAY(UUID), default=[])
    created_at = Column("created_at",TIMESTAMP,default=datetime.utcnow())
