# Base image for dependency installation and build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy only package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install pnpm & deps
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the project and build
COPY . .
RUN pnpm build

# Production image
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm

# Copy only necessary files for runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js* ./

EXPOSE 4600

# Start Next.js
CMD ["pnpm", "start"]
