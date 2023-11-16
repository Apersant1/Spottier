import unittest
from typing import Any, Coroutine
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.jwt import generate_jwt,decode_jwt
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





class MockUser:
    def __init__(self, user_id, is_superuser):
        self.id = user_id
        self.is_superuser = is_superuser

class TestAuthInitializer(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        ...
    async def test_initializer(self):
        initializer = AuthInitializer()
        secret = "secret_phrase"
        initializer.initializer(secret)
        self.assertEqual(initializer.secret_phrase, secret)
        self.assertIsInstance(initializer.bearer_transport, BearerTransport)
        self.assertIsInstance(initializer.auth_backend, AuthenticationBackend)

    async def test_get_jwt_strategy(self):
        initializer = AuthInitializer()
        secret = "secret_phrase"
        initializer.initializer(secret)
        strategy = initializer.get_jwt_strategy()
        self.assertIsInstance(strategy, CustomJWTStrategy)

    async def test_write_token(self):
        strategy = CustomJWTStrategy(secret="secret_phrase", lifetime_seconds=3600)
        user = MockUser(user_id=1, is_superuser=True)
        user_token = await strategy.write_token(user)

        decoded_data = decode_jwt(user_token, "secret_phrase", algorithms=["HS256"],audience=["fastapi-users:auth"])
        self.assertEqual(decoded_data["sub"], str(user.id))
        self.assertEqual(decoded_data["aud"], strategy.token_audience)
        self.assertEqual(decoded_data["is_superuser"], user.is_superuser)
        print(f"\n User: {decoded_data}")
