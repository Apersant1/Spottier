from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def test_endpoint():
    return {"sda":"123"}

