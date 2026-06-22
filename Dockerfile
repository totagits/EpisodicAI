# EpisodicAI API — Monorepo-aware Dockerfile
# Build from the REPO ROOT: gcloud run deploy episodic-ai-api --source .

# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install TypeScript globally for package compilation
RUN npm install -g typescript

# Copy monorepo root manifests + workspace packages
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all workspace deps (monorepo)
RUN npm install --legacy-peer-deps

# Compile each shared package to CommonJS JS
# Each package gets a tsconfig generated on the fly
RUN cd packages/types && \
    echo '{"compilerOptions":{"module":"commonjs","target":"es2021","outDir":"./dist","declaration":true,"skipLibCheck":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true},"include":["index.ts"]}' > tsconfig.json && \
    tsc && \
    node -e "const p=require('./package.json');p.main='dist/index.js';p.types='dist/index.d.ts';require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2))"

RUN cd packages/canon-engine && \
    echo '{"compilerOptions":{"module":"commonjs","target":"es2021","outDir":"./dist","declaration":true,"skipLibCheck":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true},"include":["index.ts"]}' > tsconfig.json && \
    tsc || true && \
    node -e "const p=require('./package.json');p.main='dist/index.js';p.types='dist/index.d.ts';require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2))"

RUN cd packages/pricing-engine && \
    echo '{"compilerOptions":{"module":"commonjs","target":"es2021","outDir":"./dist","declaration":true,"skipLibCheck":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true},"include":["index.ts"]}' > tsconfig.json && \
    tsc || true && \
    node -e "const p=require('./package.json');p.main='dist/index.js';p.types='dist/index.d.ts';require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2))"

RUN cd packages/provider-sdk && \
    echo '{"compilerOptions":{"module":"commonjs","target":"es2021","outDir":"./dist","declaration":true,"skipLibCheck":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true,"strictBindCallApply":false,"strict":false},"include":["index.ts"]}' > tsconfig.json && \
    tsc || true && \
    node -e "const p=require('./package.json');p.main='dist/index.js';p.types='dist/index.d.ts';require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2))"

# Build the API (now packages have dist/index.js)
# Re-install to pick up the updated package.json main fields
RUN npm install --legacy-peer-deps
RUN npm run build --workspace=apps/api

# ─── Run Stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/ ./apps/api/

# Cloud Run injects PORT env var; the API must listen on it
ENV PORT=8080

WORKDIR /app/apps/api
EXPOSE 8080

CMD ["node", "dist/main.js"]
