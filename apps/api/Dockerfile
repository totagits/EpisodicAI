# Build Stage
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN npm install
RUN npm run build --workspace=apps/api

# Run Stage
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/ ./apps/api/

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
