package com.foodrush.delivery.dto;

import com.foodrush.delivery.model.DeliveryPartner;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PartnerDTO {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String email;
    private String vehicleType;
    private String vehicleNumber;
    private String profileImageUrl;
    private String status;
    private Boolean isVerified;
    private Double currentLat;
    private Double currentLng;
    private Long currentOrderId;
    private Integer totalDeliveries;
    private Double totalEarnings;
    private Double rating;
    private LocalDateTime lastLocationUpdate;
    private LocalDateTime createdAt;

    public static PartnerDTO from(DeliveryPartner p) {
        return PartnerDTO.builder()
            .id(p.getId())
            .userId(p.getUserId())
            .name(p.getName())
            .phone(p.getPhone())
            .email(p.getEmail())
            .vehicleType(p.getVehicleType())
            .vehicleNumber(p.getVehicleNumber())
            .profileImageUrl(p.getProfileImageUrl())
            .status(p.getStatus().name())
            .isVerified(p.getIsVerified())
            .currentLat(p.getCurrentLat())
            .currentLng(p.getCurrentLng())
            .currentOrderId(p.getCurrentOrderId())
            .totalDeliveries(p.getTotalDeliveries())
            .totalEarnings(p.getTotalEarnings())
            .rating(p.getRating())
            .lastLocationUpdate(p.getLastLocationUpdate())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
