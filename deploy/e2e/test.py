import unittest
import pydantic
import requests
import logging
from pydantic import Field
from uuid import UUID
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from typing import List
from datetime import datetime

ENTRYPOINT = 'http://policy-enforcement-service:4999/'
TEAM_ENDPOINT = 'http://team-service:5003/'
DATABASE_DSN = 'postgresql://postgres:postgres@teamDB:5432/postgres'
ACCESS_DENIED_MESSAGE = {"message": "Content not found"}


class Team(pydantic.BaseModel):
    id: UUID
    name: str
    desc: str 
    member_count: int
    members: List[UUID]
    created_at : datetime


class User(pydantic.BaseModel):
    email: str
    username: str
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False

class TestBaseUtils(unittest.TestCase):
    def setUp(self) -> None:
        pass

    def test_service_available(self):
        response = requests.get(ENTRYPOINT)
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIsInstance(data, dict)
        self.assertDictEqual(data, ACCESS_DENIED_MESSAGE)



class TestTeamBase(unittest.TestCase):
    def __init__(self, methodName: str = "runTest") -> None:
        super().__init__(methodName)
        self.test_team: Team = None
        self.team_id = None
    def setUp(self, name: str, desc: str) -> None:
        self._test_create_team(name=name,desc=desc)
    def tearDown(self) -> None:
        self._delete_team()


    def _test_create_team(self,name:str,desc:str):
        payload={
            "name":name,
            "desc":desc
        }
        try:
            response = requests.post(f'{TEAM_ENDPOINT}teams',json=payload)
            self.assertEqual(response.status_code, 201)
            self.test_team = Team(**response.json())
        except requests.exceptions.HTTPError as exc:
            print(exc)
        
    def _delete_team(self):
        if self.test_team is None:
            return
        engine = create_engine(DATABASE_DSN)
        with engine.connect() as connection:
            connection.execute(text(f"""DELETE FROM "teams" WHERE id = '{self.test_team.id}';"""))
            connection.commit()

   
class TestTeam(TestTeamBase):
    def setUp(self) -> None:
        super().setUp("test", "test")

    def tearDown(self) -> None:
        return super().tearDown()

    def test_get_user(self):
        response = requests.get(f"{TEAM_ENDPOINT}teams")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data,list)

    def test_get_user_by(self):
        response = requests.get(f"{TEAM_ENDPOINT}teams/{self.test_team.id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data,dict)


if __name__ == '__main__':
    unittest.main()
