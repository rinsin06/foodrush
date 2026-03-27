# 🍔 FoodRush - Production-Ready Food Delivery Platform

A full-stack food delivery application built with Java microservices and React.js.

## 🏗️ Architecture

```
Client (React.js) → API Gateway (8080) → Microservices
├── Auth Service       :8081  (JWT authentication)
├── Restaurant Service :8082  (restaurants & menus)
├── Order Service      :8083  (orders & coupons)
├── Payment Service    :8084  (Razorpay integration)
└── Notification Svc   :8085  (Kafka consumer)
Infrastructure: MySQL × 4 | Redis | Kafka | Zookeeper
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
│   ├── api-gateway/         Spring Cloud Gateway
│   ├── auth-service/        JWT + User management
│   ├── restaurant-service/  Restaurants + Menus
│   ├── order-service/       Orders + Coupons + Cart
│   ├── payment-service/     Razorpay integration
│   └── notification-service/ Kafka consumer + Email
└── frontend/
    └── src/
        ├── api/             Axios API modules
        ├── store/slices/    Redux Toolkit slices
        ├── components/      Reusable React components
        ├── pages/           Route pages
        └── hooks/           Custom React hooks
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

## 🎨 Features

**User Side:**
- 🏠 Hero landing page with animations
- 🔍 Restaurant search with live filters
- 🗂️ Categorized menu with add-to-cart
- 🛒 Redux-powered cart with restaurant switch
- 🏷️ Coupon system (FIRST50, SAVE20, FREEDEL)
- 💳 Razorpay payment (mock available)
- 📦 Real-time order tracking with timeline
- 📋 Order history

**Admin Panel:** Dashboard analytics, manage restaurants, users, orders, offers

**Restaurant Panel:** Manage menu, accept/reject orders, update status

**AI Chatbot:** Floating assistant powered by Claude API with food recommendations, coupon suggestions, and FAQs

**UI/UX:** Dark/light mode, glassmorphism cards, skeleton loading, toast notifications, Framer Motion animations

## 🔧 Environment Variables

See `.env.example` for all required variables.

Key variables:
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars)
- `MYSQL_ROOT_PASSWORD` - MySQL root password
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Payment gateway keys
- `VITE_OPENAI_MOCK=true` - Use mock AI responses (no API key needed)

## 🚢 CI/CD

GitHub Actions pipelines are configured:
- **Backend:** Tests all microservices in matrix, builds Docker images, deploys via SSH
- **Frontend:** Lints, builds, pushes Docker image

Configure these GitHub secrets:
- `PROD_HOST`, `PROD_USER`, `SSH_PRIVATE_KEY` - For deployment
- `VITE_API_BASE_URL`, `VITE_RAZORPAY_KEY` - For frontend build

## 📜 License

MIT License - See LICENSE file for details
