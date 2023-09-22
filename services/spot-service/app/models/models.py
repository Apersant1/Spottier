from datetime import datetime
from sqlalchemy import Column, String,  UUID, JSON

from ..database import Base


class Spot(Base):
    __tablename__ = "spots"
    id = Column("id",UUID, primary_key=True, index=True)
    name = Column("name", String, nullable=False)
    desc = Column("desc", String)
    position = Column("position",JSON,nullable=False)
    registered_at = Column("registered_at", default=datetime.utcnow)
