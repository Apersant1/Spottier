import uuid
from datetime import datetime
from fastapi import status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from .models import Team
from .schemas import TeamCreate,TeamUpdate

def get_all_teams(db:Session):
    all_teams = db.query(Team).all()
    if all_teams is not None:
        return all_teams
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
            content={"Error":"Teams not found"})
    

def get_team(teamId:uuid.UUID,db:Session):
    db_team = db.query(Team).filter(Team.id == teamId).first()
    if db_team is not None:
        return db_team
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})


def create_team(team:TeamCreate,db:Session) -> TeamCreate:
    try:
        db_team = Team(
        id = uuid.uuid4(),
        name = team.name,
        desc = team.desc,
        member_count=0,
        members=[],
        created_at = datetime.utcnow()
        )
        db.add(db_team)
        db.commit()
        db.refresh(db_team)
        return db_team
    except SQLAlchemyError as e:
        db.rollback()
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN,content={"Error":e})

def update_team(teamId:uuid.UUID,team:TeamUpdate,db:Session):
    '''
    Update info about team
    '''
    result = db.query(Team)\
        .filter(Team.id == teamId)\
        .update(team.dict())
    db.commit()

    if result == 1:
        return get_team(teamId=teamId, db=db)
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})

def delete_team(teamId:uuid.UUID,db:Session):
    result = db.query(Team).filter(Team.id == teamId).first()
    if result is not None:
        result = db.query(Team).filter(Team.id == teamId).delete()
        db.commit()
        return JSONResponse(status_code=status.HTTP_200_OK,\
        content={"Message":"Team deleted successfully"})
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
        content={"Error":"Team not found"})

def add_user_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session):
    try:
        result = get_team(teamId=teamId,db=db)
        
        if isinstance(result,JSONResponse):
            return result
    
        if userId in result.members:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,content={"Error":"This user is already a member of this team"})
        else:
            db.query(Team)\
                .filter(Team.id == teamId) \
                .update({
                Team.members: Team.members + [userId],
                Team.member_count: Team.member_count + 1
                })
        db.commit()
        return get_team(teamId=teamId, db=db)
    except SQLAlchemyError as e:
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

def delete_user_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session):
    try:
        result = get_team(teamId=teamId,db=db)
        if isinstance(result,JSONResponse):
            return result

        if userId in result.members:
            result.members.remove(userId)
        else:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND,\
                content={"Error":"This user is not on this team"})

        db.query(Team) \
            .filter(Team.id == teamId) \
            .update({
                Team.members: result.members,
                Team.member_count: Team.member_count - 1
            })
        db.commit()
        return JSONResponse(status_code=status.HTTP_200_OK,\
            content={"Success":"The user has been removed from the team"})
    except SQLAlchemyError as e:
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,content={"Error":e})