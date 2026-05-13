# Stage 1: Frontend bauen
FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend bauen
FROM node:22-alpine AS backend-build
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production-Image
FROM node:22-alpine
WORKDIR /app

COPY --from=backend-build /build/backend/dist      ./dist
COPY --from=backend-build /build/backend/node_modules ./node_modules
COPY --from=frontend-build /build/frontend/dist    ./public

RUN mkdir -p data

ENV PORT=3001
EXPOSE 3001

CMD ["node", "--disable-warning=ExperimentalWarning", "dist/app.js"]
