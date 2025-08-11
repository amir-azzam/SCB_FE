FROM node:22.18.0-slim AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Build using development configuration to avoid budget check
RUN npx nx reset && pnpm exec nx build room-reservation --configuration=development

# Stage 2: Serve the built app with NGINX
FROM nginx:1.25

# Copy the built app from the builder stage
COPY --from=builder /app/dist/apps/room-reservation/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
