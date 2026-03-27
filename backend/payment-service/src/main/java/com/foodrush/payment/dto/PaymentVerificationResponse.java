package com.foodrush.payment.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentVerificationResponse {
    private boolean verified;
    private String paymentId;
    private String message;
    private Long orderId;
}