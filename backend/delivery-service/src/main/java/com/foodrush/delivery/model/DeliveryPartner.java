package com.foodrush.delivery.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partners")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DeliveryPartner {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "vehicle_type", length = 50)
    @Builder.Default
    private String vehicleType = "BIKE";

    @Column(name = "vehicle_number", length = 20)
    private String vehicleNumber;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PartnerStatus status = PartnerStatus.OFFLINE;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "current_lat", precision = 10)
    private Double currentLat;

    @Column(name = "current_lng", precision = 11)
    private Double currentLng;

    @Column(name = "current_order_id")
    private Long currentOrderId;

    @Column(name = "total_deliveries")
    @Builder.Default
    private Integer totalDeliveries = 0;

    @Column(name = "total_earnings", precision = 10)
    @Builder.Default
    private Double totalEarnings = 0.0;

    @Column(name = "rating", precision = 3)
    @Builder.Default
    private Double rating = 5.0;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PartnerStatus {
        ONLINE,      // available for orders
        BUSY,        // currently delivering
        OFFLINE      // not available
    }
}
