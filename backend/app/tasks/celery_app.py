from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "flowboard",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.automations"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
)

# Optional: Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "check-due-dates-every-hour": {
        "task": "app.tasks.automations.check_due_dates",
        "schedule": 3600.0,  # Every hour
    },
}

