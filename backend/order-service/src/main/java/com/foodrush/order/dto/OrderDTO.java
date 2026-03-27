package com.foodrush.order.dto;
import com.foodrush.order.model.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private Order.OrderStatus status;
    private List<OrderItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String couponCode;
    private String deliveryAddress;
    private Order.PaymentMethod paymentMethod;
    private Order.PaymentStatus paymentStatus;
    private String paymentId;
    private String specialInstructions;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime placedAt;
    private LocalDateTime deliveredAt;
    private String deliveryPersonName;
    private String deliveryPersonPhone;
    private String cancellationReason;
    public static OrderDTO from(Order order) {
        return OrderDTO.builder()
            .id(order.getId()).orderNumber(order.getOrderNumber())
            .userId(order.getUserId()).restaurantId(order.getRestaurantId())
            .restaurantName(order.getRestaurantName()).status(order.getStatus())
            .items(order.getItems().stream().map(OrderItemDTO::from).collect(Collectors.toList()))
            .subtotal(order.getSubtotal()).deliveryFee(order.getDeliveryFee())
            .discountAmount(order.getDiscountAmount()).taxAmount(order.getTaxAmount())
            .totalAmount(order.getTotalAmount()).couponCode(order.getCouponCode())
            .deliveryAddress(order.getDeliveryAddress())
            .paymentMethod(order.getPaymentMethod()).paymentStatus(order.getPaymentStatus())
            .paymentId(order.getPaymentId()).specialInstructions(order.getSpecialInstructions())
            .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
            .placedAt(order.getPlacedAt()).deliveredAt(order.getDeliveredAt())
            .deliveryPersonName(order.getDeliveryPersonName())
            .deliveryPersonPhone(order.getDeliveryPersonPhone())
            .cancellationReason(order.getCancellationReason())
            .build();
    }
}