import uuid
import logging
import logging_loki
from fastapi import FastAPI, Depends, Query,status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator
from .schemas import Match, MatchCreate, MatchRead, MatchUpdate
from .models import Match
from .database import DB_INITIALIZER
from . import crud
from . import config

cfg: config.Config = config.load_config()

MatchHandler = logging_loki.LokiHandler(
    url=cfg.loki_dsn,
    tags={"application": "Match-service"},
    version="1",
)

logger = logging.getLogger("MatchService")
logger.setLevel(logging.INFO)
logger.addHandler(MatchHandler)


# connect to DB
SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))
logger.info(
    "Create session", 
    extra={"tags": {"service": "Match-service"}},
)
app = FastAPI(title="Match-service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

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
    all_matches = crud.get_all_match(page=page,limit=limit,db=db)
    if all_matches is not None:
        return all_matches
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
            content={"Error":"Matchs not found"})

@app.get("/matches/{matchId}", tags=["matches"],status_code=200, response_model=MatchRead, summary="Get match by id")
async def get_match(matchId: uuid.UUID, db: Session = Depends(get_db)) -> MatchRead:
    db_match = crud.get_match(matchId=matchId, db=db)
    if db_match is not None:
        return db_match
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Match not found"})


@app.patch("/matches/{matchId}",tags=["matches"], status_code=200, response_model=MatchRead, summary="Update match by id")
async def update_match(matchId: uuid.UUID, match: MatchUpdate, db: Session = Depends(get_db)) -> MatchUpdate:
    updated_match = crud.update_match_by_id(matchId=matchId, match=match, db=db)
    if updated_match is not None:
        return updated_match
    return JSONResponse(status_code=404, content={"message": "Match not found"})

@app.delete("/matches/{matchId}", tags=["matches"],status_code=201, response_model=MatchRead, summary="remove match by id")
async def delete_match(matchId: uuid.UUID, db: Session = Depends(get_db)) -> MatchRead:
    if crud.delete_match(matchId, db):
        return JSONResponse(status_code=200, content={"message": "Match successfully deleted"})
    return JSONResponse(status_code=404, content={"message": "Match not found"})


