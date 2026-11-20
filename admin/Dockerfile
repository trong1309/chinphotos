FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dev
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS builder
ARG VITE_BASE=/admin/
ARG VITE_API_URL=/api
ARG VITE_USE_MOCK=false
ENV VITE_BASE=${VITE_BASE}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_USE_MOCK=${VITE_USE_MOCK}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
