package com.foodrush.order.model;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Coupon {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 30)
    private String code;
    @Column(nullable = false, length = 200)
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;
    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;
    @Column(name = "minimum_order_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minimumOrderAmount = BigDecimal.ZERO;
    @Column(name = "max_uses")
    private Integer maxUses;
    @Column(name = "used_count") @Builder.Default
    private Integer usedCount = 0;
    @Column(name = "max_uses_per_user") @Builder.Default
    private Integer maxUsesPerUser = 1;
    @Column(name = "valid_from")
    private LocalDateTime validFrom;
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
    @Column(name = "is_active") @Builder.Default
    private Boolean isActive = true;
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    public enum DiscountType { PERCENTAGE, FLAT }
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && (validFrom == null || now.isAfter(validFrom))
            && (validUntil == null || now.isBefore(validUntil))
            && (maxUses == null || usedCount < maxUses);
    }
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValid() || orderAmount.compareTo(minimumOrderAmount) < 0) return BigDecimal.ZERO;
        BigDecimal discount = discountType == DiscountType.PERCENTAGE
            ? orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100))
            : discountValue;
        return maxDiscountAmount != null ? discount.min(maxDiscountAmount) : discount;
    }
}