# ============================================================================
# Multi-stage Dockerfile: builds React frontend, then serves everything via
# FastAPI (Python 3.11). One container, one Render Web Service.
# ============================================================================

# ---- Stage 1: Build the React / Vite frontend --------------------------------
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install deps first (better layer caching)
COPY frontend/package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY frontend/ ./

# VITE_API_URL=/api means all API calls are same-origin (no CORS needed)
ENV VITE_API_URL=/api
ENV VITE_RAZORPAY_KEY_ID=rzp_test_luxurydemo123

RUN npm run build


# ---- Stage 2: Python FastAPI backend + bundled static files ------------------
FROM python:3.11-slim AS final

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend into backend/static (FastAPI serves it from there)
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Expose Render's dynamic port (default 8000 for local testing)
ENV PORT=8000

# SQLite DB lives next to the app; non-persistent on Render free tier
# (add a Render Disk or switch to PostgreSQL for persistent data)
WORKDIR /app/backend

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
