import json
import pika
import uuid
from .models import Match
from sqlalchemy.orm import Session
from .schemas import MatchCreate, MatchUpdate
import datetime
from . import config
from dataclasses import asdict

cfg: config.Config = config.load_config()


def create_match(match: MatchCreate, db: Session) -> MatchCreate:
    db_match = Match(
        id=uuid.uuid4(),
        spot_id=match.spot_id,
        duration=match.duration,
        team_first_id=match.team_first_id,
        team_first_score=match.team_first_score,
        team_second_id=match.team_second_id,
        team_second_score=match.team_second_score,
        visible=match.visible,
        registered_at=datetime.datetime.utcnow()
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    params = pika.URLParameters(cfg.amqp)
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host=params.host,
        port=params.port,
        virtual_host=params.virtual_host,
        credentials=params.credentials
    ))
    channel = connection.channel()
    channel.queue_declare(queue='matches_queue')
    message = f"{match.spot_id}:{match.team_first_id}:{match.team_second_id}"
    channel.basic_publish(
        exchange='', routing_key='matches_queue', body=message)
    connection.close()
    return db_match


def get_all_match(page: int, limit: int, db: Session):
    return db.query(Match).offset((page - 1) * limit).limit(limit).all()


def get_match(matchId: uuid.UUID, db: Session):
    return db.query(Match).filter(Match.id == matchId).first()


def update_match_by_id(matchId: uuid.UUID, match: MatchUpdate, db: Session) -> MatchUpdate:
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
