package com.foodrush.delivery.event;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderEvent {
    private String eventType;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private LocalDateTime timestamp;
}
