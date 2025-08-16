# Build stage
FROM node:24-alpine3.19 AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Production stage
FROM node:24-alpine3.19
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
EXPOSE 4601
CMD ["node", "dist/index.js"]
