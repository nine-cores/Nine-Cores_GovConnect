# Base image for dependency installation and build
FROM node:24-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Copy only package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install pnpm & deps
RUN npm install -g pnpm && pnpm install


# Copy the rest of the project and build
COPY . .
RUN pnpm build

# Production image
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Create and switch to non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir .next \
    && chown nextjs:nodejs .next

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install *only* prod deps (smaller image)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml* ./
RUN pnpm install --prod
# Copy build output and assets (chown for non-root)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Next.js config
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js* ./

# Switch to non-root user
USER nextjs

EXPOSE 4600

# Use production start
CMD ["pnpm", "start"]
