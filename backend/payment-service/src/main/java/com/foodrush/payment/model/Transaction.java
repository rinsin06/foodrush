package com.foodrush.payment.model;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_id", nullable = false)
    private Long orderId;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "payment_id", length = 100)
    private String paymentId;
    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;
    @Column(name = "razorpay_signature", length = 500)
    private String razorpaySignature;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    @Column(length = 5) @Builder.Default
    private String currency = "INR";
    @Enumerated(EnumType.STRING)
    @Column(nullable = false) @Builder.Default
    private TransactionStatus status = TransactionStatus.INITIATED;
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    @Column(name = "failure_reason", length = 200)
    private String failureReason;
    @Column(name = "refund_id", length = 100)
    private String refundId;
    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    public enum TransactionStatus { INITIATED, SUCCESS, FAILED, REFUNDED, PENDING }
}