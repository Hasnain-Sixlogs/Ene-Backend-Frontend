   # Build stage
   FROM node:22-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   # Use production env file
   COPY .env.production .env
   RUN npm run build
   # ... rest