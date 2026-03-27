# 🍔 FoodRush - Production-Ready Food Delivery Platform
 
A full-stack food delivery application built with Java microservices and React.js.
 
## 🏗️ Architecture
 
```
Client (React.js) → API Gateway (8080) → Microservices
├── Auth Service        :8081  (JWT authentication)
├── Restaurant Service  :8082  (restaurants & menus)
├── Order Service       :8083  (orders & coupons)
├── Payment Service     :8084  (Razorpay integration)
├── Notification Svc    :8085  (Kafka consumer)
└── Delivery Service    :8087  (partner assignment & live tracking)
 
Infrastructure: MySQL × 5 | Redis | Kafka | Zookeeper
```
 
## 🚀 Quick Start
 
### Prerequisites
 
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Java 21 (for local backend dev)
 
### Run with Docker Compose
 
```bash
# 1. Clone and setup
git clone https://github.com/your-org/foodrush.git
cd foodrush
 
# 2. Configure environment
cp .env.example .env
# Edit .env with your secrets
 
# 3. Start all services
docker-compose up -d
 
# 4. Access the app
open http://localhost:3000       # Frontend
open http://localhost:8080       # API Gateway
```
 
### Local Development
 
```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
 
# Backend (example: auth-service)
cd backend/auth-service
mvn spring-boot:run  # http://localhost:8081
 
# Delivery service
cd backend/delivery-service
mvn spring-boot:run  # http://localhost:8087
```
 
## 📁 Project Structure
 
```
foodrush/
├── docker-compose.yml
├── .env.example
├── .github/workflows/
│   ├── backend-ci.yml
│   └── frontend-ci.yml
├── backend/
│   ├── api-gateway/          Spring Cloud Gateway
│   ├── auth-service/         JWT + User management
│   ├── restaurant-service/   Restaurants + Menus
│   ├── order-service/        Orders + Coupons + Cart
│   ├── payment-service/      Razorpay integration
│   ├── notification-service/ Kafka consumer + Email
│   └── delivery-service/     Partner assignment + Live tracking + WebSocket
└── frontend/
    └── src/
        ├── api/              Axios API modules
        ├── store/slices/     Redux Toolkit slices
        ├── components/       Reusable React components
        ├── pages/            Route pages
        │   └── delivery/     Delivery partner dashboard
        └── hooks/            Custom React hooks
```
 
## 🔑 API Endpoints
 
| Service | Base URL | Description |
|---------|----------|-------------|
| Auth | `POST /api/v1/auth/register` | Register user |
| Auth | `POST /api/v1/auth/login` | Login |
| Restaurants | `GET /api/v1/restaurants` | List restaurants |
| Restaurants | `GET /api/v1/restaurants/{id}/menu` | Get menu |
| Orders | `POST /api/v1/orders` | Place order |
| Orders | `GET /api/v1/orders/{id}/track` | Track order |
| Coupons | `POST /api/v1/coupons/validate` | Validate coupon |
| Payments | `POST /api/v1/payments/create-order` | Create payment |
| Payments | `POST /api/v1/payments/verify` | Verify payment |
| Delivery | `POST /api/v1/delivery/register` | Register as partner |
| Delivery | `PATCH /api/v1/delivery/me/online` | Go online |
| Delivery | `PATCH /api/v1/delivery/me/offline` | Go offline |
| Delivery | `POST /api/v1/delivery/location` | Send GPS update |
| Delivery | `POST /api/v1/delivery/orders/{id}/accept` | Accept order |
| Delivery | `POST /api/v1/delivery/orders/{id}/pickup` | Mark picked up |
| Delivery | `POST /api/v1/delivery/orders/{id}/deliver` | Mark delivered |
| Delivery | `GET /api/v1/delivery/track/{orderId}` | Live tracking (customer) |
| Delivery | `GET /api/v1/delivery/admin/partners` | Admin: list partners |
| Delivery | `PATCH /api/v1/delivery/admin/partners/{id}/verify` | Admin: verify partner |
 
## 🎨 Features
 
**User Side:**
- 🏠 Hero landing page with animations
- 🔍 Restaurant search with live filters
- 🗂️ Categorized menu with add-to-cart
- 🛒 Redux-powered cart with restaurant switch
- 🏷️ Coupon system (FIRST50, SAVE20, FREEDEL)
- 💳 Razorpay payment (mock available)
- 📦 Real-time order tracking with live map and status timeline
- 📋 Order history
 
**Delivery Partner:**
- 🛵 Partner registration and verification flow
- 🟢 Online / offline toggle
- 🔔 Incoming order popup with 30-second auto-reject countdown
- 📍 GPS location broadcasting every 4 seconds via WebSocket
- ✅ Order lifecycle — Accept → Pickup → Deliver
- 📋 Delivery history and earnings dashboard
 
**Admin Panel:**
- Dashboard analytics, manage restaurants, users, orders, offers
- Delivery partner management — view, verify, and monitor partner status
 
**Restaurant Panel:** Manage menu, accept/reject orders, update status
 
**AI Chatbot:** Floating assistant powered by Claude API with food recommendations, coupon suggestions, and FAQs
 
**UI/UX:** Dark/light mode, glassmorphism cards, skeleton loading, toast notifications, Framer Motion animations
 
## 🚚 Delivery Service
 
The delivery service runs on port **8087** with its own MySQL database on port **3311**.
 
### How it works
 
1. Customer places an order → Order Service publishes `ORDER_PLACED` event to Kafka
2. Delivery Service consumes the event → finds the nearest available partner within 15km using Haversine distance
3. New order notification is pushed to the partner via **WebSocket** (`/queue/partner/{partnerId}`)
4. Partner accepts → GPS updates broadcast to customer every 4 seconds via WebSocket (`/topic/tracking/{orderId}`)
5. Partner marks delivered → partner status returns to ONLINE automatically
 
### WebSocket Topics
 
| Topic | Consumer | Purpose |
|---|---|---|
| `/topic/tracking/{orderId}` | Customer | Live GPS + status updates |
| `/queue/partner/{partnerId}` | Partner | Incoming order notifications |
| Connect at | `/ws/delivery` | SockJS / STOMP endpoint |
 
### Partner Status Values
 
`ONLINE` → available for orders  
`BUSY` → currently on a delivery  
`OFFLINE` → not accepting orders
 
### Integration Requirements
 
When adding delivery-service to an existing deployment:
 
1. Add `delivery-db` and `delivery-service` to `docker-compose.yml`
2. Add delivery routes to `api-gateway/application.yml`
3. Forward `X-User-Email` header in `AuthenticationFilter`
4. Ensure Order Service publishes `restaurantAddress`, `deliveryLatitude`, `deliveryLongitude` in the Kafka `ORDER_PLACED` event
 
## 🔧 Environment Variables
 
See `.env.example` for all required variables.
 
Key variables:
 
| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) |
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key for frontend |
| `VITE_API_BASE_URL` | API Gateway base URL |
| `VITE_OPENAI_MOCK=true` | Use mock AI responses (no API key needed) |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address |
| `REDIS_HOST` | Redis host |

