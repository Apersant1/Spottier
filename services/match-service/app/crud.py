import uuid
from .models import Match
from sqlalchemy.orm import Session
from .schemas import MatchCreate
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

