package com.foodrush.delivery.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DeliveryAssignment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "order_number", length = 30)
    private String orderNumber;

    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(name = "restaurant_name", length = 150)
    private String restaurantName;

    @Column(name = "restaurant_address", length = 500)
    private String restaurantAddress;

    @Column(name = "delivery_address", nullable = false, length = 500)
    private String deliveryAddress;

    @Column(name = "delivery_lat")
    private Double deliveryLat;

    @Column(name = "delivery_lng")
    private Double deliveryLng;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "delivery_fee")
    @Builder.Default
    private Double deliveryFee = 40.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.PENDING;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", length = 200)
    private String rejectionReason;

    @Column(name = "partner_lat_at_accept")
    private Double partnerLatAtAccept;

    @Column(name = "partner_lng_at_accept")
    private Double partnerLngAtAccept;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AssignmentStatus {
        PENDING,            // waiting for partner to accept
        ACCEPTED,           // partner accepted, heading to restaurant
        PICKED_UP,          // partner picked up order, heading to user
        DELIVERED,          // order delivered
        REJECTED,           // partner rejected, reassign needed
        CANCELLED           // order cancelled
    }
}
