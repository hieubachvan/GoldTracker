# 🥇 GoldTracker Dashboard

Ứng dụng theo dõi **giá vàng** (SJC, PNJ, DOJI) và **tỷ giá hối đoái** (VCB) theo thời gian thực.

## Stack

| Frontend | Backend |
|----------|---------|
| React 18 + Vite | Node.js + Express |
| React Query (TanStack) | Socket.IO |
| Recharts | node-cron |
| Zustand | Mongoose (MongoDB) |
| Tailwind CSS | ioredis (Redis) |
| Socket.IO-client | Axios + Cheerio |

## Cấu trúc

```
dashboard/
├── client/          ← React app (port 5173)
│   └── src/
│       ├── components/  ← PriceCard, GoldChart, ForexTable, Header
│       ├── hooks/       ← useSocket, useGoldPrice
│       ├── pages/       ← Dashboard
│       └── store/       ← Zustand store
└── server/          ← Node.js API (port 4000)
    └── src/
        ├── crawlers/    ← gold.js, forex.js
        ├── routes/      ← prices.js, forex.js
        ├── jobs/        ← cron.js
        ├── models/      ← Price.model.js, Forex.model.js
        ├── socket/      ← socket.js
        └── config/      ← db.js
```

## Chạy dự án

### Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc Atlas)
- Redis (optional — fallback sang mock data nếu không có)

### Backend

```bash
cd server
# Cấu hình .env (đã có file mẫu)
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

Truy cập: **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/prices/latest` | Giá vàng mới nhất |
| GET | `/api/prices/history` | Lịch sử giá (query: source, type, limit) |
| GET | `/api/forex/latest` | Tỷ giá mới nhất |
| GET | `/api/forex/history` | Lịch sử tỷ giá |
| GET | `/health` | Server health check |

## Luồng dữ liệu

```
node-cron (10 phút)
  → Crawler (Axios + Cheerio)
    → Zod Validator
      → MongoDB (lưu lịch sử)
      → Redis SET (cache 5 phút)
      → Redis PUBLISH
        → Socket.IO Server emit
          → React Client (Zustand cập nhật state)
            → UI render với View Transitions
```
