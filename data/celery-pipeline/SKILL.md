---
name: celery-pipeline
description: Distributed task queue, data pipeline orchestration, and workflow automation. Use when setting up asynchronous task processing, job scheduling, or distributed computing with Celery, Redis, or RabbitMQ. Trigger on imports of celery, or mentions of task queue, background job, pipeline, distributed computing, workflow automat.
---
# celery-pipeline

Use this skill for distributed task processing and pipeline orchestration.

## Core patterns

- **Task**: `@app.task(bind=True)` → `self.request.id` for tracking.
- **Chain**: `chain(task1.s(), task2.s(), task3.s())()` for sequential pipeline.
- **Group**: `group(process.s(item) for item in items)()` for parallel execution.
- **Chord**: `chord(group(tasks), callback.s())()` for map-reduce pattern.
- **Monitoring**: `flower --broker=redis://localhost` for web dashboard.

## Rules

- Always set `time_limit` and `soft_time_limit` on tasks.
- Use `acks_late=True` for idempotent tasks to prevent message loss.
- Store results in backend (`result_backend='redis://'`) only when needed.
- Use `task.retry()` for transient failures, not permanent ones.

## Anti-patterns

- Don't pass large objects as arguments — use storage references (S3 path, DB ID).
- Don't create circular task dependencies — detect and break cycles.
- Don't ignore `WorkerLostError` — it means OOM or segfault, not normal failure.


