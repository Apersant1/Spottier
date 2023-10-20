from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy,
)

class AuthInitializer():
    def __init__(self):
        self.secret_phrase: str|None = None
        self.cookie_transport = None
        self.auth_backend = None
    def initializer(self,secret):
        self.secret_phrase = secret
        self.cookie_transport = CookieTransport(cookie_name="bonds", cookie_max_age=3600,cookie_secure=False)
        self.auth_backend = AuthenticationBackend(
            name="jwt",
            transport=self.cookie_transport,
            get_strategy=self.get_jwt_strategy,
        )

    def get_jwt_strategy(self) -> JWTStrategy:
        return JWTStrategy(secret=self.secret_phrase, lifetime_seconds=3600)


