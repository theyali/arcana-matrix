# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# ---------- run ----------
FROM nginx:1.27-alpine
WORKDIR /
# наш простой entrypoint создаст /usr/share/nginx/html/env.js из ENV
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# скрипт, который пишет env.js при старте контейнера
COPY docker-entrypoint.d/99-env.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
