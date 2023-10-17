import uuid
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

SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))

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
    return crud.get_all_teams(db=db)

@app.get("/teams/{teamId}",tags=["teams"],status_code=status.HTTP_200_OK,response_model=TeamRead)
async def get_team_by_id(teamId:uuid.UUID,db:Session = Depends(get_db)):
    return crud.get_team(teamId=teamId,db=db)


@app.patch("/teams/{teamId}",tags=["teams"],status_code=status.HTTP_200_OK,response_model=TeamRead)
async def update_team_by_id(teamId:uuid.UUID,team:TeamUpdate,db:Session = Depends(get_db)):
    return crud.update_team(teamId=teamId,team=team,db=db)
    


@app.delete("/teams/{teamId}",tags=["teams"],)
async def delete_team_by_id(teamId:uuid.UUID,db:Session = Depends(get_db)):
    return crud.delete_team(teamId=teamId,db=db)


@app.patch("/teams/{teamId}/add-users/{userId}",tags=["teams"],response_model=TeamRead)
async def add_user_in_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session = Depends(get_db)):
    return crud.add_user_team(teamId=teamId,userId=userId,db=db)
  
     
    

@app.patch("/teams/{teamId}/delete-users/{userId}",tags=["teams"])
async def delete_user_from_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session = Depends(get_db)):
    return crud.delete_user_team(teamId=teamId,userId=userId,db=db)

