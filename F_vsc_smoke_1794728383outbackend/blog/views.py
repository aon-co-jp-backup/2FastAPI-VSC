from typing import Optional
from fastapi import APIRouter, Form, HTTPException, Header, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
import json

from django.views import View
router = APIRouter()


@router.get("/")
@router.get("/v2/")
def index():
    return HTMLResponse(content="hello django", status_code=200)


@router.get("/articles/{year}/{slug}/")
@router.get("/v2/articles/{year}/{slug}/")
def article(year: int, slug):
    # comments are kept by the converter
    return {"year": year, "slug": slug}


@router.get("/search/")
@router.get("/v2/search/")
def search(q: str = "", page: str = 1):
    page = int(page)
    return {"q": q, "page": page}


@router.post("/create/")
@router.post("/v2/create/")
def create(name: str = Form("anon")):
    return JSONResponse(content={"created": name}, status_code=201)


@router.get("/items/{pk}/")
@router.get("/v2/items/{pk}/")
def detail(pk: int):
    if pk > 3:
        raise HTTPException(status_code=404, detail="no such item")
    return {"pk": pk}


@router.api_route("/both/", methods=["GET", "POST"])
@router.api_route("/v2/both/", methods=["GET", "POST"])
def both(request: Request):
    if request.method == "POST":
        return {"m": "post"}
    return {"m": "get"}


@router.get("/go/")
@router.get("/v2/go/")
def go():
    return RedirectResponse("/", status_code=302)


@router.get("/agent/")
@router.get("/v2/agent/")
def agent(x_agent: str = Header("none")):
    return {"agent": x_agent}


@router.get("/archive/{year}/")
@router.get("/v2/archive/{year}/")
def archive(year):
    return {"archive": year}


NOTES = {1: "first", 2: "second"}


@router.get("/notes/")
@router.get("/v2/notes/")
def Notes_get(limit: str = "10"):
    limit = int(limit)
    return {"notes": list(NOTES.values())[:limit]}


@router.post("/notes/")
@router.post("/v2/notes/")
def Notes_post(text: Optional[str] = Form(None)):
    if not text:
        return JSONResponse(content={"error": "text required"}, status_code=400)
    return JSONResponse(content={"created": text}, status_code=201)


@router.get("/notes/{pk}/")
@router.get("/v2/notes/{pk}/")
def NoteDetail_get(pk: int):
    if pk not in NOTES:
        raise HTTPException(status_code=404)
    return {"id": pk, "text": NOTES[pk]}


@router.delete("/notes/{pk}/")
@router.delete("/v2/notes/{pk}/")
def NoteDetail_delete(pk: int):
    return {"deleted": pk}
