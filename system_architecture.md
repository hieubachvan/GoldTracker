# 🏗️ System Architecture & Data Flow

Dưới đây là sơ đồ trực quan hóa kiến trúc hệ thống và luồng dữ liệu chi tiết dựa trên stack công nghệ đã cung cấp.

## 1. Tổng quan kiến trúc hệ thống (System Architecture)

Biểu đồ này thể hiện cấu trúc tổng thể của hệ thống, bao gồm các thành phần Frontend, Backend, Database và External Sources tương tác với nhau như thế nào.

```mermaid
graph TD
    subgraph Client ["🖥️ Frontend (React 18 + Vite)"]
        UI["UI Components<br/>(PriceCard, Chart, ForexTable)"]
        State["State Management<br/>(Zustand, React Query)"]
        WS_Client["WebSocket Client<br/>(Socket.IO-client)"]
        Charts["Data Visualization<br/>(Recharts)"]
        
        UI <--> State
        State <--> Charts
        State <--> WS_Client
    end

    subgraph Server ["⚙️ Backend (Node.js)"]
        API["REST API<br/>(Express.js)"]
        WS_Server["WebSocket Server<br/>(Socket.IO)"]
        Jobs["Task Scheduler<br/>(node-cron)"]
        Crawlers["Data Crawlers<br/>(Axios, Cheerio)"]
        Validator["Data Validation<br/>(Zod)"]
        Logger["System Log<br/>(Winston)"]

        Jobs --> Crawlers
        Crawlers --> Validator
    end

    subgraph Database ["🗄️ Database Layer"]
        Redis[("Redis<br/>(Cache & Pub/Sub)")]
        Mongo[("MongoDB<br/>(Historical Data)")]
    end

    subgraph External ["🌐 External Data Sources"]
        GoldSources["SJC, PNJ, DOJI, GoldAPI"]
        BankSources["Vietcombank (Foreign Exchange)"]
    end

    %% Data Flow Connections
    Client -- "HTTP REST Requests" --> API
    WS_Client -- "Real-time connection" --> WS_Server
    
    API -- "Query historical data" --> Mongo
    API -- "Get latest (fast)" --> Redis
    
    WS_Server -- "Subscribe to events" --> Redis
    
    Crawlers -- "Crawl HTML/JSON" --> External
    Validator -- "Save time-series" --> Mongo
    Validator -- "Update & Publish" --> Redis
    Crawlers -. "Log errors" .-> Logger
```

## 2. Luồng dữ liệu chi tiết (Detailed Data Flow)

Sơ đồ tuần tự (Sequence Diagram) dưới đây mô tả chính xác luồng di chuyển của dữ liệu từ lúc crawler được kích hoạt cho đến khi người dùng nhìn thấy dữ liệu cập nhật trên giao diện.

```mermaid
sequenceDiagram
    autonumber
    
    box rgb(40, 44, 52) Background Tasks
        participant Cron as node-cron (Scheduler)
        participant API as External Data Source
        participant Crawler as Crawler (Axios + Cheerio)
        participant Validator as Zod Validator
    end

    box rgb(33, 50, 43) Data Layer
        participant DB as MongoDB (Mongoose)
        participant Cache as Redis (ioredis)
    end
    
    box rgb(50, 40, 50) Delivery & Client
        participant WS as Socket.IO Server
        participant Client as React Client (Zustand/RQ)
        participant UI as UI Components
    end

    Cron->>Crawler: Kích hoạt (mỗi 5-15 phút)
    activate Crawler
    Crawler->>API: Gọi HTTP GET request
    API-->>Crawler: Trả về HTML / JSON
    
    Crawler->>Crawler: Parse & Extract (Cheerio)
    Crawler->>Validator: Gửi dữ liệu thô
    Validator-->>Crawler: Trả về dữ liệu chuẩn hoá
    
    par Lưu trữ DB dài hạn
        Crawler->>DB: Save data (Historical price)
    and Cập nhật Cache & Bắn sự kiện
        Crawler->>Cache: SET giá mới nhất (TTL: 5 min)
        Crawler->>Cache: PUBLISH event "price_updated"
    end
    deactivate Crawler

    Cache-->>WS: Trigger Pub/Sub message
    
    activate WS
    WS->>Client: Emit "new_price_data" via WebSocket
    deactivate WS
    
    activate Client
    Client->>Client: Update Zustand Store / Invalidate RQ
    Client->>UI: Trigger React Re-render
    deactivate Client
    
    Note over UI: UI áp dụng view-transition<br/>để animate thay đổi số liệu mượt mà
```

## 📋 Tóm tắt cấu trúc thư mục (Tham khảo)

Mô hình kiến trúc trên trực tiếp tương ứng với cấu trúc thư mục của dự án:

```text
project/
├── client/                     ← Frontend (React/Vite)
│   └── src/
│       ├── components/         ← PriceCard, Chart, ForexTable (Visual Layer)
│       ├── hooks/              ← useGoldPrice, useForex (Logic Layer)
│       ├── store/              ← Zustand store (State Layer)
│       └── services/           ← socket.client.js, api.client.js
└── server/                     ← Backend (Node.js)
    └── src/
        ├── crawlers/           ← sjc.js, goldapi.js, vcb.js (Axios, Cheerio)
        ├── routes/             ← api/prices, api/forex (Express REST)
        ├── jobs/               ← cron.js (node-cron)
        ├── models/             ← Price.model.js (Mongoose/MongoDB)
        ├── utils/              ← validator.js (Zod), logger.js (Winston)
        └── socket/             ← socket.server.js (Socket.IO, Redis Pub/Sub)
```
