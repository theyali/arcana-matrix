#!/bin/sh
# Создаёт /usr/share/nginx/html/env.js при старте контейнера
set -e
cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV = Object.assign({}, window.__ENV, {
  DEFAULT_THEME: "${DEFAULT_THEME:-theme-mindful-03}",
  API_URL: "${API_URL:-http://localhost:8000}"
});
EOF
