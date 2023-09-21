import uuid

from fastapi import FastAPI
from fastapi_users import FastAPIUsers

from fastapi.logger import logger
from .config import DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER,SECRET
from .database import DB_INITIALIZER, create_db_and_tables,User
from .auth import AuthInitializer
from .schemas import UserRead, UserCreate, UserUpdate
from .manager import get_user_manager

logger.info('Initializing database...')


DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SessionLocal = DB_INITIALIZER.init_database(DATABASE_URL)

auth = AuthInitializer()
auth.initializer(SECRET)


fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth.auth_backend])

current_active_user = fastapi_users.current_user(active=True)


# TODO
# Тут нужно подумать как модуль auth проиницизировать, по аналогии с DB_INITIALIZER
# или переписать всю инициализацию через DI https://fastapi.tiangolo.com/tutorial/dependencies/ 
# Модуль auth не должен знать, про config.py


app = FastAPI(
    version='0.0.1',
    title='User-Service'
)


app.include_router(
    fastapi_users.get_auth_router(auth.auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
# app.include_router(
#     fastapi_users.get_reset_password_router(),
#     prefix="/auth",
#     tags=["auth"],
# )
# app.include_router(
#     fastapi_users.get_verify_router(UserRead),
#     prefix="/auth",
#     tags=["auth"],
# )
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


@app.on_event("startup")
async def on_startup():
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
