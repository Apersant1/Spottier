from fastapi import FastAPI
from .schemas import SpotCreate
from . import crud

app = FastAPI()


@app.post("/spot", status_code=201, response_model=SpotCreate,
    summary='Добавляет спортивную площадку в базу'
)
async def add_spot(spot:SpotCreate) -> SpotCreate:
    return crud.create_spot(spot=spot)
