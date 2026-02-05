# Развёртывание приложения в интернете

Фронтенд — на **Vercel**, бэкенд — на **Railway** (или Render). База — **MongoDB Atlas** (уже есть).

---

## Шаг 1. Бэкенд на Railway

1. Зайди на [railway.app](https://railway.app), войди через GitHub.
2. **New Project** → **Deploy from GitHub repo** → выбери репозиторий PizzaCalk.
3. В настройках проекта укажи **Root Directory**: `backend`.
4. **Settings** → **Build** / **Deploy**: команду запуска задай вручную: `npm run start:full` (или **Start Command**: `npm run start:full`), чтобы поднимался бэкенд с MongoDB, а не демо-сервер.
5. **Variables** (переменные окружения):
   - `MONGODB_URI` — твоя строка подключения к Atlas (из `.env`).
   - `CORS_ORIGIN` — URL фронта на Vercel (добавишь после шага 2, например `https://pizzacalk.vercel.app`).
6. Railway сам соберёт и запустит бэкенд. В **Settings** → **Networking** включи **Generate Domain** и скопируй URL (например `https://pizzacalk-backend.up.railway.app`). Это адрес твоего API.

---

## Шаг 2. Фронтенд на Vercel

1. Зайди на [vercel.com](https://vercel.com), войди через GitHub.
2. **Add New** → **Project** → импортируй репозиторий PizzaCalk.
3. **Root Directory**: укажи `frontend` (или выбери папку `frontend`).
4. **Environment Variables**:
   - Имя: `VITE_API_URL`  
   - Значение: URL бэкенда с Railway **без слэша в конце** (например `https://pizzacalk-backend.up.railway.app`).
5. Нажми **Deploy**. Дождись сборки — получишь ссылку на сайт (например `https://pizzacalk-xxx.vercel.app`).

---

## Шаг 3. Подставить URL фронта в бэкенд

1. Вернись в Railway → твой проект бэкенда → **Variables**.
2. Поставь или измени `CORS_ORIGIN` на точный адрес фронта с Vercel (например `https://pizzacalk-xxx.vercel.app`). Если нужно несколько доменов — перечисли через запятую.
3. Сохрани — Railway перезапустит сервис.

---

## Готово

Открой ссылку на фронт с Vercel. Визиты (IP + дата) будут сохраняться в MongoDB Atlas; в коллекции `pagevisits` появятся реальные IP пользователей.

---

### Альтернатива бэкенду: Render

Вместо Railway можно использовать [render.com](https://render.com): **New** → **Web Service** → подключи репо, укажи Root Directory `backend`, команду сборки `npm install && npm run build`, команду запуска `node dist/index.js`, добавь переменные `MONGODB_URI` и `CORS_ORIGIN`.
