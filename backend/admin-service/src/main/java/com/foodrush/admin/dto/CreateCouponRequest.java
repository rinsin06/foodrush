package com.foodrush.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateCouponRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String discountType; // PERCENTAGE or FLAT
    @NotNull
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minimumOrderAmount;
    private Integer usageLimit;
    private LocalDateTime expiresAt;
    private boolean active = true;
}
