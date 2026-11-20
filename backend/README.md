# Aura Atelier - FastAPI Backend

High-performance REST API for Aura Atelier Luxury Jewellery.

## Quickstart
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure .env (copied from .env.example)
copy .env.example .env

# 3. Start server
uvicorn app.main:app --reload --port 8000
```

- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

