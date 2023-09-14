from fastapi import FastAPI

app = FastAPI()


@app.get("/api/py/hello")
def hello_world():
    return {"message": "Hello World"}
