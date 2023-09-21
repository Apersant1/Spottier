from datetime import datetime
from sqlalchemy import MetaData, Table, Column, String, Boolean, TIMESTAMP,UUID


metadata = MetaData()

user = Table(
    "spots",
    metadata,
    Column("id",UUID,nullable=False),
    Column("name",String,nullable=False),
    Column("desc",String,nullable=False),
    Column("registered_at", TIMESTAMP, default=datetime.utcnow),
)
