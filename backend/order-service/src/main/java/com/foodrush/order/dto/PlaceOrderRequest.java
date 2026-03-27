package com.foodrush.order.dto;
import com.foodrush.order.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlaceOrderRequest {
    @NotNull private Long restaurantId;
    @NotBlank private String restaurantName;
    @NotEmpty @Valid private List<OrderItemRequest> items;
    @NotBlank private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    @NotNull private Order.PaymentMethod paymentMethod;
    private String couponCode;
    private String specialInstructions;
}