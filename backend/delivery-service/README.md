# FoodRush — Delivery Service

**Port:** 8087 | **DB:** delivery_db (MySQL 3311)

---

## Run Options

### Option A — Run with Docker (Recommended)
```bash
# From the delivery-service folder:
docker-compose up --build
```
This starts:
- `delivery-db` on port 3311
- `delivery-service` on port 8087

Requires Eureka (8761) and Kafka (9092) already running on host.

---

### Option B — Run with IntelliJ / Maven
```bash
# 1. Start MySQL on port 3311 (or update application.yml port)
# 2. From delivery-service folder:
mvn spring-boot:run
```

---

### Option C — Add to existing docker-compose.yml
Copy contents of `DOCKER_COMPOSE_ADDITION.yml` into your root `docker-compose.yml`

---

## Integration Checklist

### 1. API Gateway — add routes
Copy from `GATEWAY_ROUTES.yml` into `api-gateway/src/main/resources/application.yml`

```yaml
- id: delivery-service-public
  uri: lb://delivery-service
  predicates:
    - Path=/api/v1/delivery/track/**

- id: delivery-service
  uri: lb://delivery-service
  predicates:
    - Path=/api/v1/delivery/**
  filters:
    - name: AuthenticationFilter
```

---

### 2. AuthenticationFilter — forward email header
In `api-gateway/.../AuthenticationFilter.java`, add `X-User-Email`:

```java
String email = jwtUtil.getEmail(token); // subject = email in your JWT
exchange.getRequest().mutate()
    .header("X-User-Id", String.valueOf(userId))
    .header("X-User-Email", email)          // ← ADD THIS
    .build();
```

In `JwtUtil.java` add:
```java
public String getEmail(String token) {
    return extractClaim(token, Claims::getSubject);
}
```

---

### 3. Order Service — ensure OrderEvent has required fields
`order-service` must publish to Kafka topic `order.events` with these fields in `OrderEvent`:

```java
private String restaurantAddress;   // ← add if missing
private Double deliveryLatitude;    // ← add if missing  
private Double deliveryLongitude;   // ← add if missing
```

And in `OrderServiceImpl.java` when publishing:
```java
eventPublisher.publishOrderEvent(OrderEvent.builder()
    ...
    .restaurantAddress(restaurant.getAddress())   // ← add
    .deliveryLatitude(request.getDeliveryLatitude())   // ← add
    .deliveryLongitude(request.getDeliveryLongitude())  // ← add
    .build());
```

---

### 4. Register a ROLE_DELIVERY role in auth-service
Add `ROLE_DELIVERY` to your roles enum/table if you want delivery partners
to have a dedicated role (optional — service works without it).

---

## WebSocket Topics (Frontend)

| Who        | Topic                          | Purpose                            |
|------------|--------------------------------|------------------------------------|
| Customer   | `/topic/tracking/{orderId}`    | Live GPS + status from partner     |
| Partner    | `/queue/partner/{partnerId}`   | New order notifications            |
| Connect at | `/ws/delivery` (SockJS/STOMP)  | WebSocket endpoint                 |

---

## Key API Endpoints

| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| POST   | /api/v1/delivery/register                   | Register as partner      |
| PATCH  | /api/v1/delivery/me/online                  | Go online                |
| PATCH  | /api/v1/delivery/me/offline                 | Go offline               |
| POST   | /api/v1/delivery/location                   | Send GPS update          |
| POST   | /api/v1/delivery/orders/{id}/accept         | Accept order             |
| POST   | /api/v1/delivery/orders/{id}/pickup         | Mark picked up           |
| POST   | /api/v1/delivery/orders/{id}/deliver        | Mark delivered           |
| GET    | /api/v1/delivery/track/{orderId}            | Track order (customer)   |
| GET    | /api/v1/delivery/admin/partners             | Admin: list partners     |
| PATCH  | /api/v1/delivery/admin/partners/{id}/verify | Admin: verify partner    |
