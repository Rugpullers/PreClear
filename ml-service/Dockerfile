FROM python:3.12-slim

WORKDIR /app

# Install system dependencies required by LightGBM (libgomp for OpenMP)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model files
COPY . .

# Fix Windows CRLF line endings in model files (LightGBM requires LF)
RUN sed -i 's/\r$//' model/*.txt

# Expose port
EXPOSE 8001

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
