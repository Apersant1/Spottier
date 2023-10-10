from datetime import datetime
from sqlalchemy import Column, String, UUID,Integer,Boolean,TIMESTAMP
from ..database import Base

class Match(Base):
    __tablename__ = "match"
    id = Column("id", UUID, primary_key=True, index=True)
    spot_id = Column("match_id",String,nullable=False)
    duration = Column("duration",Integer)
    team_first_id = Column("team_first_id",String)
    team_first_score = Column("team_first_score",Integer)
    team_second_id = Column("team_second_id",String)
    team_second_score = Column("team_second_score",Integer)
    visible = Column("visible",Boolean,default=True)
    registered_at = Column("registered_at", TIMESTAMP, default=datetime.utcnow)
