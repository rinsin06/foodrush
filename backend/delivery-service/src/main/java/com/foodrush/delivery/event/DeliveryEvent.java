package com.foodrush.delivery.event;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeliveryEvent {
    private String eventType;       // DELIVERY_ASSIGNED | DELIVERY_ACCEPTED | ORDER_PICKED_UP | ORDER_DELIVERED
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private Long partnerId;
    private String partnerName;
    private String partnerPhone;
    private String vehicleType;
    private Double partnerLat;
    private Double partnerLng;
    private String assignmentStatus;
    private LocalDateTime timestamp;
}
