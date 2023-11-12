import aio_pika
import asyncio
from telegram import Bot
from pydantic import Field
from pydantic_settings import BaseSettings

class Config(BaseSettings):
    token_bot:str = Field(
        default='',
        env='TOKEN_BOT',
        alias='TOKEN_BOT'
    )
    chat_id: str = Field(
        default='',
        env='CHAT_ID',
        alias='CHAT_ID'
        
    )
    amqp_url: str = Field(
        default='',
        env='AMQP_URL',
        alias='AMQP_URL'
        
    )
    class Config:
        env_file = ".env"


def load_config() -> Config:
    return Config()


cfg : Config = load_config()

token_bot = cfg.token_bot
chat_id = cfg.chat_id
amqp_url = cfg.amqp_url
# Set up connection to RabbitMQ
async def consume_from_queue():
    connection = await aio_pika.connect_robust(amqp_url)
    channel = await connection.channel()

    # Declare the queue
    queue = await channel.declare_queue("matches_queue")

    # Create an instance of the Telegram bot using your bot token
    bot = Bot(token=token_bot)

    # Define the callback function for consuming messages from the queue
    async def callback(message):
        async with message.process():
            match_id, team_first_id, team_second_id = message.body.decode('utf-8').split(':')
            msg=f"WAS CREATED NEW MATCH:\n\n Match id: {match_id}\nHome team: {team_first_id}\nAway team: {team_second_id}"
            await bot.send_message(chat_id=chat_id, text=msg)

    # Start consuming messages from the queue
    await queue.consume(callback)

    # Keep the event loop running
    while True:
        await asyncio.sleep(1)

# Run the consumer
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.create_task(consume_from_queue())
    loop.run_forever()