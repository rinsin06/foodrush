package com.foodrush.delivery.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LiveLocationMessage {
    private Long partnerId;
    private Long orderId;
    private Double latitude;
    private Double longitude;
    private String partnerName;
    private String partnerPhone;
    private String vehicleType;
    private String status;            // ACCEPTED | PICKED_UP | DELIVERED
    private String trackingStatus;    // human-readable status message
    private LocalDateTime timestamp;
}
