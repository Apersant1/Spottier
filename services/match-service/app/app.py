from fastapi import FastAPI
app = FastAPI(title="Match-service")



@app.get('/')
async def boilerplate():
    return {f"{__name__}":"test"}