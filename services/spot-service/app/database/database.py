from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base



class DatabaseInitializer():
    def __init__(self, base) -> None:
        self.base = base

    def init_database(self, postgres_dsn):
        engine = create_engine(postgres_dsn)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


        self.base.metadata.create_all(bind=engine)
        return SessionLocal

Base: DeclarativeMeta = declarative_base()
DB_INITIALIZER = DatabaseInitializer(Base)


