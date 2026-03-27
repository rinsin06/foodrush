package com.foodrush.notification.model;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationEvent {
    private String eventType;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private String restaurantName;
    private BigDecimal totalAmount;
    private String userEmail;
    private String deliveryAddress;
    private LocalDateTime timestamp;
}
