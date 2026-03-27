package com.foodrush.order.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItemRequest {
    @NotNull private Long menuItemId;
    @NotBlank private String itemName;
    @NotNull @DecimalMin("0.01") private BigDecimal price;
    @NotNull @Min(1) private Integer quantity;
    private Boolean isVeg;
}