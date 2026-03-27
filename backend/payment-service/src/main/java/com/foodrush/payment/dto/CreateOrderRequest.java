package com.foodrush.payment.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateOrderRequest {
    @NotNull private Long orderId;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
    @NotBlank private String currency;
    private String receipt;
}