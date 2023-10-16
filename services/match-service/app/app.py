import uuid
from fastapi import FastAPI, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator
from .schemas import Match, MatchCreate, MatchRead, MatchUpdate
from .models import Match
from .database import DB_INITIALIZER
from . import crud
from . import config

cfg: config.Config = config.load_config()

# connect to DB
SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))

app = FastAPI(title="Match-service")

Instrumentator().instrument(app).expose(app)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# endpoints

@app.post("/matches", tags=["matches"],status_code=201, response_model=MatchRead, summary="Add new match")
async def add_spot(match: MatchCreate, db: Session = Depends(get_db)) -> MatchCreate:
    return crud.create_match(match=match, db=db)


@app.get("/matches", tags=["matches"],status_code=201, response_model=list[MatchRead], summary="get all matches")
async def get_all_matches(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)) -> list[MatchRead]:
    return db.query(Match).offset((page - 1) * limit).limit(limit).all()


@app.get("/matches/{matchId}", tags=["matches"],status_code=201, response_model=MatchRead, summary="Get match by id")
async def get_match(matchId: uuid.UUID, db: Session = Depends(get_db)) -> MatchRead:
    return crud.get_match(matchId=matchId, db=db)


@app.patch("/matches/{matchId}",tags=["matches"], status_code=201, response_model=MatchRead, summary="Update match by id")
async def update_match(matchId: uuid.UUID, match: MatchUpdate, db: Session = Depends(get_db)) -> MatchUpdate:
    return crud.update_match_by_id(matchId=matchId, match=match, db=db)


@app.delete("/matches/{matchId}", tags=["matches"],status_code=201, response_model=MatchRead, summary="remove match by id")
async def delete_match(matchId: uuid.UUID, db: Session = Depends(get_db)) -> MatchRead:
    if crud.delete_match(matchId, db):
        return JSONResponse(status_code=200, content={"message": "Item successfully deleted"})
    return JSONResponse(status_code=404, content={"message": "Item not found"})
