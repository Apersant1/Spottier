from datetime import datetime
from sqlalchemy import Column, String,  UUID, Float,JSON,Integer,Sequence
from ..database import Base

class Match(Base):
    __tablename__ = "match"
    id = Column("id", UUID, primary_key=True, index=True)
    spot_id = Column("match_id",UUID,nullable=False)
    result = Column("result",JSON,default={"1":0,"2":0})
    duration = Column("duration",Integer)
    team_ids = Column("team_ids",list[UUID])

