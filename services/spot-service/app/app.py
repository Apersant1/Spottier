from fastapi import FastAPI


app = FastAPI()


@app.get("/")
async def root():
    return {"2222":"1111"}


@app.get("/app")
async  def test():
    return {f"{__name__}":test}
