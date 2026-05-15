# ALTHR Signal Engine — Python Data Engine
# Runs feature extraction, regime detection, pattern scanning, and RL inference.
# GPU passthrough enabled via docker-compose deploy.resources.

FROM python:3.11-slim

WORKDIR /app

# System deps for numerical libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy engine source
COPY engine/ ./engine/

# Expose FastAPI port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["python", "-m", "uvicorn", "engine.main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "1"]
