# Tarion — ИИ Таро · Матрица · Гороскопы (React + Vite + Tailwind)

Готовый одностраничный сайт. Темизация через CSS‑переменные и предустановленные темы из твоей палитры (#F2F3F4, #DED1C6, #A77693, #174871, #0F2D4D).

## Запуск в Docker

```bash
docker compose up --build
# открывай http://localhost:8081
```

Сменить дефолтную тему сборки:
- В `docker-compose.yml` измени аргумент `VITE_DEFAULT_THEME` (варианты: `theme-mindful-01/03/04/05`) и пересобери.
- В рантайме можно переключать тему в шапке (селектор тем). Выбор сохраняется в `localStorage`.

## Разработка локально (без Docker)

```bash
npm i
npm run dev
# http://localhost:5173
```

## Где менять цвета

Файл: `src/theme/tokens.css` — тут заданы темы (по фото-палитре). Можно добавить свою, например:

```css
.theme-my-brand {
  --bg-start: #123456;
  --bg-mid:   #654321;
  --bg-end:   #001122;
  --text:     #FFFFFF;
  --muted:    rgba(255,255,255,0.15);
  --primary:  #A77693;
  --accent:   #DED1C6;
}
```

После добавления — выбери её в селекторе тем в шапке или укажи как `VITE_DEFAULT_THEME`.

## Структура

```
src/
  app/App.jsx
  components/ (Navbar, Hero, Section, Buttons, Pill, Bubble, Footer)
  features/
    tarot.jsx, matrix.jsx, experts.jsx, forum.jsx, pricing.jsx, telegram.jsx
  theme/
    tokens.css, themes.js
  index.css, main.jsx
```

## Продакшен

Контейнер Nginx сервит статический билд (`/dist`). Любые роутинги SPA отдаются через `index.html`.

— Удачи! Если надо — добавлю auth, оплату (Stripe/YooKassa/crypto), API, интеграцию с твоим Telegram‑ботом.


docker compose --profile dev down
docker compose --profile dev up -d
