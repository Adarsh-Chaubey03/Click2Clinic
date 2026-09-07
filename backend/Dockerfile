# ── Stage 1: Build Node.js dependencies ────────────────────────
FROM node:18-slim AS node-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 2: Final image with Node.js + Python ────────────────
FROM node:18-slim

# Install Python 3.10 and pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Node dependencies from build stage
COPY --from=node-deps /app/node_modules ./node_modules

# Copy backend source
COPY . .

# Install Python dependencies (CPU-only PyTorch to keep image small)
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Create uploads directory for multer temp files
RUN mkdir -p /tmp/uploads

# Expose the port Render will inject
EXPOSE 3000

# Start Node.js server
CMD ["node", "server.js"]
