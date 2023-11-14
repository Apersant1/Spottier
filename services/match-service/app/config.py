from pydantic import PostgresDsn,Field
from pydantic_settings import BaseSettings

class Config(BaseSettings):
    postgres_dsn: PostgresDsn = Field(
        default='postgresql://user:pass@localhost:5432/foobar',
        env='POSTGRES_DSN',
        alias='POSTGRES_DSN'
    )
    loki_dsn: str = Field(
        default='http://loki:3100/loki/api/v1/push',
        env='LOKI_URL',
        alias='LOKI_URL'
        
    )
    amqp: str = Field(
        default='amqp://guest:guest@localhost/',
        env='AMQP',
        alias='AMQP'
        
    )
    class Config:
        env_file = ".env"


def load_config() -> Config:
    return Config()