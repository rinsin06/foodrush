# 🍔 FoodRush — Complete API Reference

## Base URL
```
Production:  https://api.foodrush.app
Development: http://localhost:8080
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Auth Service (`/api/v1/auth`)

| Method | Endpoint               | Auth | Description                    |
|--------|------------------------|------|--------------------------------|
| POST   | `/register`            | ❌   | Register new user              |
| POST   | `/login`               | ❌   | Login and receive JWT tokens   |
| POST   | `/refresh-token`       | ❌   | Refresh access token           |
| POST   | `/logout`              | ✅   | Invalidate current session     |
| POST   | `/logout-all`          | ✅   | Invalidate all sessions        |
| GET    | `/validate`            | ✅   | Validate a token (gateway use) |
| GET    | `/me`                  | ✅   | Get current user profile       |
| PUT    | `/me`                  | ✅   | Update profile                 |
| POST   | `/change-password`     | ✅   | Change password                |

### Register
```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "9876543210",
  "role": "USER"
}
```

### Login
```json
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Response
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900000,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["USER"]
  }
}
```

---

## 🏪 Restaurant Service (`/api/v1/restaurants`)

| Method | Endpoint                          | Auth       | Role        | Description              |
|--------|-----------------------------------|------------|-------------|--------------------------|
| GET    | `/`                               | ❌         | Public      | List restaurants         |
| GET    | `/search?query=pizza`             | ❌         | Public      | Search restaurants       |
| GET    | `/nearby?lat=&lng=&radius=5`      | ❌         | Public      | Find nearby restaurants  |
| GET    | `/:id`                            | ❌         | Public      | Get restaurant details   |
| POST   | `/`                               | ✅         | RESTAURANT  | Create restaurant        |
| PUT    | `/:id`                            | ✅         | RESTAURANT  | Update restaurant        |
| DELETE | `/:id`                            | ✅         | ADMIN       | Delete restaurant        |
| GET    | `/my`                             | ✅         | RESTAURANT  | Get my restaurants       |
| PATCH  | `/:id/status`                     | ✅         | RESTAURANT  | Update status            |

### Menu Endpoints (`/api/v1/restaurants/:id/menu`)

| Method | Endpoint          | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | `/`               | ❌   | Full menu by categories  |
| GET    | `/items`          | ❌   | Flat menu item list      |
| POST   | `/items`          | ✅   | Add menu item            |
| PUT    | `/items/:itemId`  | ✅   | Update menu item         |
| DELETE | `/items/:itemId`  | ✅   | Delete menu item         |
| POST   | `/categories`     | ✅   | Add category             |

---

## 📦 Order Service (`/api/v1/orders`)

| Method | Endpoint             | Auth | Description               |
|--------|----------------------|------|---------------------------|
| POST   | `/`                  | ✅   | Place a new order         |
| GET    | `/`                  | ✅   | Get my order history      |
| GET    | `/:id`               | ✅   | Get order details         |
| PATCH  | `/:id/status`        | ✅   | Update order status       |
| POST   | `/:id/cancel`        | ✅   | Cancel an order           |
| GET    | `/:id/track`         | ✅   | Track order               |

### Place Order Request
```json
POST /api/v1/orders
{
  "restaurantId": 1,
  "restaurantName": "Pizza Palace",
  "items": [
    {
      "menuItemId": 101,
      "itemName": "Margherita Pizza",
      "price": 299.00,
      "quantity": 2,
      "isVeg": true
    }
  ],
  "deliveryAddress": "123 Main St, Bangalore 560001",
  "deliveryLatitude": 12.9716,
  "deliveryLongitude": 77.5946,
  "paymentMethod": "RAZORPAY",
  "couponCode": "SAVE20",
  "specialInstructions": "Extra cheese please"
}
```

---

## 🎟️ Coupons (`/api/v1/coupons`)

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/`                   | ❌   | List available coupons   |
| POST   | `/validate`           | ✅   | Validate coupon          |
| POST   | `/`                   | ✅   | Create coupon (ADMIN)    |
| PUT    | `/:id`                | ✅   | Update coupon (ADMIN)    |
| DELETE | `/:id`                | ✅   | Delete coupon (ADMIN)    |

---

## 💳 Payment Service (`/api/v1/payments`)

| Method | Endpoint                    | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| POST   | `/create-order`             | ✅   | Create Razorpay order          |
| POST   | `/verify`                   | ✅   | Verify payment signature       |
| GET    | `/history`                  | ✅   | Payment transaction history    |
| POST   | `/:transactionId/refund`    | ✅   | Initiate refund (ADMIN)        |
| GET    | `/order/:orderId`           | ✅   | Get payment by order           |

### Create Razorpay Order
```json
POST /api/v1/payments/create-order
{
  "orderId": 123,
  "amount": 598.00,
  "currency": "INR"
}
```

### Verify Payment
```json
POST /api/v1/payments/verify
{
  "razorpayOrderId": "order_abc123",
  "razorpayPaymentId": "pay_xyz789",
  "razorpaySignature": "hmac_signature_here",
  "orderId": 123
}
```

---

## 🤖 Chatbot (`/api/v1/chatbot`)

| Method | Endpoint  | Auth | Description       |
|--------|-----------|------|-------------------|
| POST   | `/chat`   | ❌   | Chat with AI bot  |

```json
POST /api/v1/chatbot/chat
{
  "message": "What do you recommend for dinner?",
  "history": [
    { "role": "user", "content": "I like spicy food" },
    { "role": "assistant", "content": "Great choice! Here are some spicy options..." }
  ]
}
```

---

## 👑 Admin Routes (`/api/v1/admin`) — ADMIN role required

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/dashboard/stats`            | Platform analytics         |
| GET    | `/users`                      | List all users (paginated) |
| PUT    | `/users/:id/block`            | Block a user               |
| PUT    | `/users/:id/unblock`          | Unblock a user             |
| GET    | `/orders`                     | All orders (paginated)     |
| GET    | `/orders?status=PLACED`       | Filter orders by status    |

---

## 📊 Response Codes

| Code | Meaning                          |
|------|----------------------------------|
| 200  | Success                          |
| 201  | Created                          |
| 400  | Bad Request / Business Error     |
| 401  | Unauthorized (missing/bad token) |
| 403  | Forbidden (insufficient role)    |
| 404  | Resource Not Found               |
| 422  | Validation Failed                |
| 429  | Rate Limited                     |
| 500  | Internal Server Error            |
| 503  | Service Unavailable (circuit open) |

---

## 🔄 Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Coupon has expired",
  "fieldErrors": {
    "email": "Invalid email format"
  }
}
```

---

## 🌐 Pagination
All list endpoints support:
```
?page=0&size=10&sort=createdAt,desc
```

Response:
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```
