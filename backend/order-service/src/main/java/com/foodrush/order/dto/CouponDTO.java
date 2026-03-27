package com.foodrush.order.dto;

import com.foodrush.order.model.Coupon;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CouponDTO {
    private Long id;
    private String code;
    private String description;
    private String discountType;   // String not enum — easier for frontend
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minimumOrderAmount;
    private Integer maxUses;
    private Integer maxUsesPerUser;
    private Integer usedCount;
    private Boolean isActive;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    public static CouponDTO from(Coupon c) {
        return CouponDTO.builder()
                .id(c.getId())
                .code(c.getCode())
                .description(c.getDescription())
                .discountType(c.getDiscountType().name())  // convert enum to String
                .discountValue(c.getDiscountValue())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .minimumOrderAmount(c.getMinimumOrderAmount())
                .maxUses(c.getMaxUses())
                .maxUsesPerUser(c.getMaxUsesPerUser())
                .usedCount(c.getUsedCount())
                .isActive(c.getIsActive())
                .validFrom(c.getValidFrom())
                .validUntil(c.getValidUntil())
                .build();
    }
}