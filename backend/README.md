# Flowboard Backend

A FastAPI-based backend for the Flowboard Kanban application.

## Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
- Copy `.env.example` to `.env`
- Fill in your TiDB credentials and SECRET_KEY

4. Run migrations:
```bash
alembic upgrade head
```

5. Start the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Running Celery (Background Tasks)

```bash
# Worker
celery -A app.tasks.celery_app worker --loglevel=info

# Beat (scheduler)
celery -A app.tasks.celery_app beat --loglevel=info
```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Config, security, JWT
│   ├── db/models/       # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic, WebSocket
│   └── tasks/           # Celery tasks
├── alembic/             # Database migrations
└── requirements.txt
```

