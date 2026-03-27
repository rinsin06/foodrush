package com.foodrush.delivery.dto;

import com.foodrush.delivery.model.DeliveryAssignment;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AssignmentDTO {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long partnerId;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String deliveryAddress;
    private Double deliveryLat;
    private Double deliveryLng;
    private Double totalAmount;
    private Double deliveryFee;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;

    // Partner info (joined)
    private String partnerName;
    private String partnerPhone;
    private String partnerVehicle;
    private Double partnerLat;
    private Double partnerLng;

    public static AssignmentDTO from(DeliveryAssignment a) {
        return AssignmentDTO.builder()
            .id(a.getId())
            .orderId(a.getOrderId())
            .orderNumber(a.getOrderNumber())
            .partnerId(a.getPartnerId())
            .userId(a.getUserId())
            .restaurantId(a.getRestaurantId())
            .restaurantName(a.getRestaurantName())
            .restaurantAddress(a.getRestaurantAddress())
            .deliveryAddress(a.getDeliveryAddress())
            .deliveryLat(a.getDeliveryLat())
            .deliveryLng(a.getDeliveryLng())
            .totalAmount(a.getTotalAmount())
            .deliveryFee(a.getDeliveryFee())
            .status(a.getStatus().name())
            .assignedAt(a.getAssignedAt())
            .acceptedAt(a.getAcceptedAt())
            .pickedUpAt(a.getPickedUpAt())
            .deliveredAt(a.getDeliveredAt())
            .createdAt(a.getCreatedAt())
            .build();
    }
}
