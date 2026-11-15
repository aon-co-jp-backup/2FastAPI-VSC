# 2FastAPI conversion report

Routes written: 26
Run: `uvicorn main:app --reload`

## Warnings (manual work needed)

- line 0: [regex] urls.py: group year ([0-9]{4}) constraint dropped (value stays a str, like Django)
- line 0: [regex] urls.py: group year ([0-9]{4}) constraint dropped (value stays a str, like Django)
- line 3: [django-api] blog/views.py: `django.views` is Django-specific and not converted
- line 58: [class-view] blog/views.py: class Notes converted to one route function per HTTP method (Notes_get, Notes_post)
- line 70: [class-view] blog/views.py: class NoteDetail converted to one route function per HTTP method (NoteDetail_get, NoteDetail_delete)
