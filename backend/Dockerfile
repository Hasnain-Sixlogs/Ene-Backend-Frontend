# Use Node.js 22 (latest stable)
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Debug: Show what files were copied
RUN echo "=== Directory structure ===" && \
    ls -la && \
    echo "=== Config directory ===" && \
    (ls -la config/ || echo "Config directory not found") && \
    echo "=== Checking database.js ===" && \
    (cat config/database.js | head -5 || echo "database.js not readable") && \
    echo "=== Checking server.js ===" && \
    (head -5 server.js || echo "server.js not readable")

# Verify critical files exist
RUN test -f config/database.js || (echo "ERROR: database.js not found!" && ls -la config/ && exit 1)
RUN test -f server.js || (echo "ERROR: server.js not found!" && exit 1)

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('https://ene-backend-454164503170.us-south1.run.app/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]