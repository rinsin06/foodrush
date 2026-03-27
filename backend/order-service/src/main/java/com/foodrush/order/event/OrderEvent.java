package com.foodrush.order.event;
import com.foodrush.order.model.Order;
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
    private Order.OrderStatus status;
    private BigDecimal totalAmount;
    private String userEmail;
    private String deliveryAddress;
    private LocalDateTime timestamp;
}