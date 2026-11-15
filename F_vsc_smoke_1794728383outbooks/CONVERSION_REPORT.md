# 2FastAPI conversion report

Routes written: 7
Run: `uvicorn app:app --reload`

## Warnings (manual work needed)

- app.py: line 2: [flask-api] flask.render_template (use fastapi.templating.Jinja2Templates: `templates.TemplateResponse(request, name, ctx)`)
- app.py: line 25: [convert] hello: render_template -> Jinja2Templates: check url_for(...) inside the templates
- app.py: line 30: [convert] upload: request.files -> UploadFile wrapped in _Upload (sync read()/save()/filename, like Werkzeug FileStorage)
