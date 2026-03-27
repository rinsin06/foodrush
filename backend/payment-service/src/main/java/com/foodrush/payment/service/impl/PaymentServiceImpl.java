package com.foodrush.payment.service.impl;
import com.foodrush.payment.dto.*;
import com.foodrush.payment.model.Transaction;
import com.foodrush.payment.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl {
    private final TransactionRepository transactionRepository;
    @Value("${app.razorpay.key-id}") private String keyId;
    @Value("${app.razorpay.key-secret}") private String keySecret;

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request, Long userId) {
        String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-","").substring(0,14);
        Transaction tx = Transaction.builder()
            .orderId(request.getOrderId()).userId(userId).razorpayOrderId(razorpayOrderId)
            .amount(request.getAmount()).currency(request.getCurrency() != null ? request.getCurrency() : "INR").build();
        Transaction saved = transactionRepository.save(tx);
        return CreateOrderResponse.builder().razorpayOrderId(razorpayOrderId)
            .amount(request.getAmount()).currency(tx.getCurrency()).keyId(keyId).transactionId(saved.getId()).build();
    }

    @Transactional
    public PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request, Long userId) {
        Transaction tx = transactionRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        boolean verified = keySecret.contains("mock") || verifySignature(
            request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());
        if (verified) {
            tx.setPaymentId(request.getRazorpayPaymentId());
            tx.setRazorpaySignature(request.getRazorpaySignature());
            tx.setStatus(Transaction.TransactionStatus.SUCCESS);
            tx.setPaymentMethod("razorpay");
        } else {
            tx.setStatus(Transaction.TransactionStatus.FAILED);
            tx.setFailureReason("Signature verification failed");
        }
        transactionRepository.save(tx);
        return PaymentVerificationResponse.builder().verified(verified)
            .paymentId(request.getRazorpayPaymentId())
            .orderId(tx.getOrderId())
            .message(verified ? "Payment successful" : "Payment verification failed").build();
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getPaymentHistory(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(TransactionDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public TransactionDTO initiateRefund(Long transactionId, Long userId) {
        Transaction tx = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (tx.getStatus() != Transaction.TransactionStatus.SUCCESS)
            throw new RuntimeException("Only successful payments can be refunded");
        tx.setStatus(Transaction.TransactionStatus.REFUNDED);
        tx.setRefundId("rfnd_" + UUID.randomUUID().toString().replace("-","").substring(0,14));
        tx.setRefundedAt(LocalDateTime.now());
        return TransactionDTO.from(transactionRepository.save(tx));
    }

    @Transactional(readOnly = true)
    public TransactionDTO getTransactionByOrder(Long orderId, Long userId) {
        return transactionRepository.findByOrderIdAndUserId(orderId, userId)
            .map(TransactionDTO::from).orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            byte[] hashBytes = mac.doFinal(payload.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            return sb.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }
}