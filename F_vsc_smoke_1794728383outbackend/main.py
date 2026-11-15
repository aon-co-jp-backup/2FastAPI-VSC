from fastapi import FastAPI

from blog.views import router as router_0

app = FastAPI()
app.include_router(router_0)
