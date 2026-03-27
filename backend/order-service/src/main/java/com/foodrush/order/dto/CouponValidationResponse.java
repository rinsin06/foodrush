package com.foodrush.order.dto;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CouponValidationResponse {
    private boolean valid;
    private BigDecimal discountAmount;
    private String message;
    public static CouponValidationResponse valid(BigDecimal discount, String msg) {
        return new CouponValidationResponse(true, discount, msg);
    }
    public static CouponValidationResponse invalid(String msg) {
        return new CouponValidationResponse(false, BigDecimal.ZERO, msg);
    }
}