import uuid
from .models import Match
from sqlalchemy.orm import Session
from .schemas import MatchCreate,MatchUpdate
import datetime

def create_match(match: MatchCreate,db:Session) -> MatchCreate:
    db_match = Match(
        id=uuid.uuid4(),
        spot_id=match.spot_id,
        duration=match.duration,
        team_first_id=match.team_first_id,
        team_first_score=match.team_first_score,
        team_second_id=match.team_second_id,
        team_second_score=match.team_second_score,
        visible=match.visible,
        registered_at = datetime.datetime.utcnow()
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_match(matchId:uuid.UUID,db:Session):
    return db.query(Match).filter(Match.id == matchId).first()


def update_match_by_id(matchId:uuid.UUID,match:MatchUpdate,db:Session) -> MatchUpdate:
    '''
    Обновляет информацию о матче
    '''
    result = db.query(Match) \
        .filter(Match.id == matchId) \
        .update(match.dict())
    db.commit()

    if result == 1:
        return get_match(matchId=matchId, db=db)
    return None



def delete_match(matchId: uuid.UUID, db: Session) -> Match:
    result = db.query(Match)\
        .filter(Match.id == matchId)\
        .delete()
    db.commit()
    return result == 1
