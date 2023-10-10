from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from .schemas import Match,MatchCreate,MatchRead
from .database import DB_INITIALIZER
from . import crud
from . import config

cfg: config.Config = config.load_config()

# connect to DB
SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))

app = FastAPI(title="Match-service")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# endpoints

@app.post("/matches",status_code=201, response_model=MatchRead, summary="Add new match")
async def add_spot(match: MatchCreate,db: Session = Depends(get_db)) -> MatchCreate:
    return crud.create_match(match=match,db=db)


# @app.get("/matches",status_code=201,response_model=list[MatchRead], summary="get all matches")
# async def get_matches():
#     pass