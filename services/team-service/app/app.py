import uuid
import logging
import logging_loki
from fastapi import FastAPI,Depends,status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import start_http_server
from .schemas import TeamRead,TeamCreate,TeamUpdate
from .database import DB_INITIALIZER
from . import config
from . import crud

cfg : config.Config = config.load_config()

TeamHandler = logging_loki.LokiHandler(
    url=cfg.loki_dsn,
    tags={"application": "Team-service"},
    version="1",
)


logger = logging.getLogger("TeamService")
logger.setLevel(logging.INFO)
logger.addHandler(TeamHandler)

SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))

logger.info(
    "Create session", 
    extra={"tags": {"service": "Team-service"}},
)

def get_db():
    """
        Get DB session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(title="Team-service",version="0.1.0")

Instrumentator().instrument(app).expose(app)

@app.post('/teams',tags=["teams"],status_code=status.HTTP_201_CREATED,response_model=TeamRead)
def create_team(team:TeamCreate,db:Session = Depends(get_db)) -> TeamCreate:
    return crud.create_team(team=team,db=db)
   


@app.get("/teams",tags=["teams"],status_code=status.HTTP_200_OK,response_model=list[TeamRead])
async def get_all_teams(db:Session = Depends(get_db)):
    all_teams = crud.get_all_teams(db=db)
    if all_teams is not None:
        return all_teams
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
            content={"Error":"Teams not found"})

@app.get("/teams/{teamId}",tags=["teams"],status_code=status.HTTP_200_OK,response_model=TeamRead)
async def get_team_by_id(teamId:uuid.UUID,db:Session = Depends(get_db)):
    db_team = crud.get_team(teamId=teamId,db=db)
    if db_team is not None:
        return db_team
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})


@app.patch("/teams/{teamId}",tags=["teams"],status_code=status.HTTP_200_OK,response_model=TeamRead)
async def update_team_by_id(teamId:uuid.UUID,team:TeamUpdate,db:Session = Depends(get_db)):
    updated_team = crud.update_team(teamId=teamId,team=team,db=db)
    if updated_team != None:
        return updated_team
    return JSONResponse(status_code=404, content={"message": "Team not found"})


@app.delete("/teams/{teamId}",tags=["teams"],)
async def delete_team_by_id(teamId:uuid.UUID,db:Session = Depends(get_db)):
    deleted_team = crud.delete_team(teamId=teamId,db=db)
    if deleted_team:
        return JSONResponse(status_code=status.HTTP_200_OK,\
        content={"Message":"Team deleted successfully"})
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})


@app.patch("/teams/{teamId}/add-users/{userId}",tags=["teams"],response_model=TeamRead)
async def add_user_in_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session = Depends(get_db)):
    add_user_team = crud.add_user_team(teamId=teamId,userId=userId,db=db)
    if add_user_team is not None:
        return add_user_team
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})
     
    

@app.patch("/teams/{teamId}/delete-users/{userId}",tags=["teams"],response_model=TeamRead)
async def delete_user_from_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session = Depends(get_db)):
    remove_user_from_team = crud.delete_user_team(teamId=teamId,userId=userId,db=db)
    if remove_user_from_team == 1:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})
    elif remove_user_from_team == 2:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"User is not in team"})
    else:
        return remove_user_from_team