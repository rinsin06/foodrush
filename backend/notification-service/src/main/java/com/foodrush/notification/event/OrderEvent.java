package com.foodrush.notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// com.foodrush.notification.event.OrderEvent
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String eventType;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private Object status;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private LocalDateTime timestamp;
}
