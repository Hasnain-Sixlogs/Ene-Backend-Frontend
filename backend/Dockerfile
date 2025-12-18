# Use Node.js 22 (latest stable)
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code (excluding what's in .dockerignore)
COPY . .

# Explicitly copy config directory to ensure all files are included
COPY config/ ./config/

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

# Final verification before runtime - list all files that will be in the image
RUN echo "=== Final verification - Files in config directory ===" && \
    ls -la config/ && \
    echo "=== Verifying database.js exists ===" && \
    test -f config/database.js && echo "✅ database.js confirmed" || (echo "❌ database.js MISSING!" && exit 1)

# Create uploads directory
RUN mkdir -p uploads

# Create secrets directory for Cloud Run secret mounts
RUN mkdir -p /app/secrets

# Ensure config directory has correct permissions
RUN chmod -R 755 config/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('https://ene-backend-454164503170.us-south1.run.app/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Add a startup script that verifies critical files exist
RUN echo '#!/bin/sh' > /app/verify-startup.sh && \
    echo 'echo "=== Runtime Verification ==="' >> /app/verify-startup.sh && \
    echo 'echo "Current directory: $(pwd)"' >> /app/verify-startup.sh && \
    echo 'echo "Files in config directory:"' >> /app/verify-startup.sh && \
    echo 'ls -la /app/config/ || echo "Config directory not found"' >> /app/verify-startup.sh && \
    echo 'if [ ! -f /app/config/database.js ]; then' >> /app/verify-startup.sh && \
    echo '  echo "⚠️  WARNING: database.js is missing at runtime! Server will start with dummy database function."' >> /app/verify-startup.sh && \
    echo 'else' >> /app/verify-startup.sh && \
    echo '  echo "✅ database.js found at runtime"' >> /app/verify-startup.sh && \
    echo 'fi' >> /app/verify-startup.sh && \
    echo 'exec node server.js' >> /app/verify-startup.sh && \
    chmod +x /app/verify-startup.sh

# Start server with verification
CMD ["/app/verify-startup.sh"]