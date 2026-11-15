"""Second sample: hooks, templates, uploads, Flask-RESTful resources, CORS."""
from typing import Any
import uvicorn
from fastapi import Body, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
class _Upload:
    """Werkzeug FileStorage-like wrapper around Starlette's UploadFile (sync API)."""

    def __init__(self, f):
        self._f = f
        self.filename = f.filename
        self.content_type = f.content_type
        self.stream = f.file

    def read(self, *a):
        return self._f.file.read(*a)

    def save(self, dst):
        import shutil
        with open(dst, "wb") as out:
            shutil.copyfileobj(self._f.file, out)

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BOOKS = {1: {"title": "Dune"}, 2: {"title": "Emma"}}


@app.middleware("http")
async def block_admin(request: Request, call_next):
    if request.url.path == "/blocked":
        return JSONResponse(content=dict(error="blocked"), status_code=403)
    return await call_next(request)


@app.exception_handler(404)
def not_found(request: Request, e):
    return JSONResponse(content=dict(error="not found"), status_code=404)


@app.get("/hello/{name}")
def hello(name, request: Request):
    return templates.TemplateResponse(request, "hello.html", {'name': name, 'items': [1, 2, 3]})


@app.post("/upload")
def upload(doc: UploadFile = File(...)):
    f = _Upload(doc)
    data = f.read()
    return dict(filename=f.filename, size=len(data))


@app.get("/blocked")
def blocked():
    return HTMLResponse(content="never reached")


@app.get("/books/{book_id}")
def Book_get(book_id: int):
    if book_id not in BOOKS:
        raise HTTPException(status_code=404, detail="no such book")
    return BOOKS[book_id]


@app.delete("/books/{book_id}")
def Book_delete(book_id: int):
    return JSONResponse(content={"deleted": book_id}, status_code=202)


@app.get("/books")
def BookList_get():
    return {"books": list(BOOKS.values())}


@app.post("/books")
def BookList_post(payload: Any = Body(None)):
    data = payload
    return JSONResponse(content={"created": data["title"]}, status_code=201)

if __name__ == "__main__":
    uvicorn.run(app)
