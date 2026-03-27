package com.foodrush.payment.dto;
import com.foodrush.payment.model.Transaction;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private Long orderId;
    private String paymentId;
    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private Transaction.TransactionStatus status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime refundedAt;
    public static TransactionDTO from(Transaction t) {
        return TransactionDTO.builder().id(t.getId()).orderId(t.getOrderId())
            .paymentId(t.getPaymentId()).razorpayOrderId(t.getRazorpayOrderId())
            .amount(t.getAmount()).currency(t.getCurrency()).status(t.getStatus())
            .paymentMethod(t.getPaymentMethod()).createdAt(t.getCreatedAt())
            .refundedAt(t.getRefundedAt()).build();
    }
}