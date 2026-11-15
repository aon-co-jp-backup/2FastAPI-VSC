"""Sample Flask app used by the tests."""
from typing import Any
import uvicorn
from fastapi import APIRouter, Body, FastAPI, Form, HTTPException, Header, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

app = FastAPI()
api = APIRouter(prefix="/api")

ITEMS = {1: "apple", 2: "banana"}


@app.get("/")
def index():
    return HTMLResponse(content="hello flask")  # plain text


@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in ITEMS:
        raise HTTPException(status_code=404)
    return {"id": item_id, "name": ITEMS[item_id]}


@app.get("/search")
def search(q: str = "", limit: int = 10):
    return dict(query=q, limit=limit)


@app.post("/echo")
def echo(payload: Any = Body(None)):
    data = payload
    return JSONResponse(content=data, status_code=201)


@app.post("/form")
def form(name: str = Form("anon")):
    return {"hello": name}


@app.get("/hdr")
def hdr(x_agent: str = Header("none")):
    return dict(agent=x_agent)


@app.get("/old")
def old():
    return RedirectResponse("/", status_code=302)


@app.get("/files/{p:path}")
def files(p):
    return dict(path=p)


@app.api_route("/both", methods=["GET", "POST"])
def both(request: Request):
    if request.method == "POST":
        return dict(method="post")
    return dict(method="get")


@api.get("/ping")
def ping():
    return dict(pong=True)


@api.get("/sum/{a}/{b}")
def add(a: int, b: int):
    return dict(sum=a + b)


app.include_router(api)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
