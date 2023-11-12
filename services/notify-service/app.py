import aio_pika
import asyncio
from telegram import Bot

# Set up connection to RabbitMQ
async def consume_from_queue():
    connection = await aio_pika.connect_robust("amqps://fmnyttgp:gpgbJ-PjnJiFP9cnXg6ih1OC3yBXBBOS@shrimp.rmq.cloudamqp.com/fmnyttgp")
    channel = await connection.channel()

    # Declare the queue
    queue = await channel.declare_queue("matches_queue")

    # Create an instance of the Telegram bot using your bot token
    bot = Bot(token='6634977077:AAEG_r8L6jDgKS4NONgGJhLosxH7yG7V-5Q')

    # Define the callback function for consuming messages from the queue
    async def callback(message):
        async with message.process():
            match_id, team_first_id, team_second_id = message.body.decode('utf-8').split(':')
            msg=f"WAS CREATED NEW MATCH:\n\n Match id: {match_id}\nHome team: {team_first_id}\nAway team: {team_second_id}"
            await bot.send_message(chat_id='753848489', text=msg)

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