import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from .models import Team
from .schemas import TeamCreate,TeamUpdate

def create_team(team:TeamCreate,db:Session) -> TeamCreate:
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
    

def get_all_teams(db:Session):
    return db.query(Team).all()
    
    

def get_team(teamId:uuid.UUID,db:Session):
    return db.query(Team).filter(Team.id == teamId).first()
    



def update_team(teamId:uuid.UUID,team:TeamUpdate,db:Session):
    '''
    Update info about team
    '''
    result =  db.query(Team)\
        .filter(Team.id == teamId)\
        .update(team.dict())
    db.commit()

    if result == 1:
        return get_team(teamId=teamId, db=db)
    return None

def delete_team(teamId:uuid.UUID,db:Session):
    result = db.query(Team).filter(Team.id == teamId).delete()
    db.commit()
    return result == 1

def add_user_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session):
    add_user_team = db.query(Team)\
                .filter(Team.id == teamId) \
                .update({
                Team.members: Team.members + [userId],
                Team.member_count: Team.member_count + 1
                })
    db.commit()
    return get_team(teamId=teamId, db=db)

def delete_user_team(teamId:uuid.UUID,userId:uuid.UUID,db:Session):
    result = get_team(teamId=teamId,db=db)
    if result is None:
        return 1
    if userId in result.members:
        result.members.remove(userId)
    else:
        return 2
    db.query(Team) \
        .filter(Team.id == teamId) \
        .update({
            Team.members: result.members,
            Team.member_count: Team.member_count - 1
        })
    db.commit()
    return get_team(teamId=teamId,db=db)