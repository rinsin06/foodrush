package com.foodrush.order.model;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;
    @Column(name = "restaurant_name", length = 150)
    private String restaurantName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PLACED;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;
    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee;
    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;
    @Column(name = "coupon_code", length = 30)
    private String couponCode;
    @Column(name = "delivery_address", nullable = false, length = 500)
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    @Column(name = "payment_id", length = 100)
    private String paymentId;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;
    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    @Column(name = "cancellation_reason", length = 300)
    private String cancellationReason;
    @Column(name = "delivery_person_name", length = 100)
    private String deliveryPersonName;
    @Column(name = "delivery_person_phone", length = 15)
    private String deliveryPersonPhone;
    @CreatedDate
    @Column(name = "placed_at", updatable = false)
    private LocalDateTime placedAt;
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum OrderStatus { PLACED, CONFIRMED, PREPARING, READY_FOR_PICKUP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED }
    public enum PaymentMethod { RAZORPAY, STRIPE, CASH_ON_DELIVERY, WALLET }
    public enum PaymentStatus { PENDING, PAID, FAILED, REFUNDED }

    public boolean isCancellable() {
        return status == OrderStatus.PLACED || status == OrderStatus.CONFIRMED;
    }
    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this.status) {
            case PLACED -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED;
            case PREPARING -> newStatus == OrderStatus.READY_FOR_PICKUP;
            case READY_FOR_PICKUP -> newStatus == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED -> newStatus == OrderStatus.REFUNDED;
            default -> false;
        };
    }
}