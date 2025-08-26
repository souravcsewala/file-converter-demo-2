# Worker Dockerfile (production) - Debian base with LibreOffice
FROM node:20-bullseye-slim

# Install LibreOffice and required fonts/tools for conversions
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libreoffice \
        libreoffice-writer \
        libreoffice-calc \
        ghostscript \
        fonts-dejavu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /app

# Copy env file into the image so the container can read it directly
# (it will live at /app/.env inside the container)
# COPY .env /app/.env

# Install production dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Default command: start the worker
CMD ["node", "workers/converterWorker.js"]
