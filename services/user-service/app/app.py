import uuid
import logging
import logging_loki
from fastapi import FastAPI
from fastapi_users import FastAPIUsers
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.logger import logger
from . import config
from .database import DB_INITIALIZER, create_db_and_tables,User
from .auth import AuthInitializer
from .schemas import UserRead, UserCreate, UserUpdate
from .manager import get_user_manager



cfg : config.Config = config.load_config()

UserHandler = logging_loki.LokiHandler(
    url=cfg.loki_dsn,
    tags={"application": "User-service"},
    version="1",
)


logger = logging.getLogger("UserService")
logger.setLevel(logging.INFO)
logger.addHandler(UserHandler)


SessionLocal = DB_INITIALIZER.init_database(str(cfg.postgres_dsn))
logger.info(
    "Create session", 
    extra={"tags": {"service": "User-service"}},
)
auth = AuthInitializer()
auth.initializer(cfg.SECRET)


fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth.auth_backend])

current_active_user = fastapi_users.current_user(active=True)




app = FastAPI(
    version='0.0.1',
    title='User-Service'
)

Instrumentator().instrument(app).expose(app)

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
