---
name: fastapi
description: REST API development framework for scientific web services. Use when building HTTP endpoints, serving ML models as APIs, handling file uploads, or creating microservices. Trigger on imports of fastapi, uvicorn, or mentions of API endpoint, REST service, web server, model serving.
---
# fastapi

Use this skill for building scientific web APIs and microservices.

## Core patterns

- **App**: `app = FastAPI(title="My API", version="1.0")`.
- **Route**: `@app.post("/predict")` with type-annotated parameters.
- **Request model**: `class PredictionRequest(BaseModel):` with Pydantic validation.
- **File upload**: `UploadFile` parameter for multipart data.
- **Run**: `uvicorn.run(app, host="0.0.0.0", port=8000)`.

## Rules

- Always define response models with `response_model=PredictionResponse`.
- Use `HTTPException(status_code=404, detail="Not found")` for error handling.
- Add CORS middleware when serving frontend: `CORSMiddleware(allow_origins=["*"])`.
- Use `BackgroundTasks` for long-running operations.

## Anti-patterns

- Don't block the event loop — use `async def` with `await` for I/O.
- Don't load ML models inside route handlers — load at startup with `@app.on_event("startup")`.
- Don't return raw dicts — use Pydantic response models for documentation.


