from typing import Any, Coroutine
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.jwt import generate_jwt

class CustomJWTStrategy(JWTStrategy):
    async def write_token(self, user: Any) -> Coroutine[Any, Any, str]:
        data = {"sub": str(user.id), "aud": self.token_audience, "is_superuser": user.is_superuser}
        return generate_jwt(
            data, self.encode_key, self.lifetime_seconds, algorithm=self.algorithm
        )


class AuthInitializer():
    def __init__(self):
        self.secret_phrase: str|None = None
        self.cookie_transport = None
        self.auth_backend = None
    def initializer(self,secret):
        self.secret_phrase = secret
        self.bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
        self.auth_backend = AuthenticationBackend(
            name="jwt",
            transport=self.bearer_transport,
            get_strategy=self.get_jwt_strategy,
        )

    def get_jwt_strategy(self) -> JWTStrategy:
        return CustomJWTStrategy(secret=self.secret_phrase, lifetime_seconds=3600)



