package com.foodrush.payment.controller;
import com.foodrush.payment.dto.*;
import com.foodrush.payment.service.impl.PaymentServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentServiceImpl paymentService;
    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createOrder(request, userId));
    }
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(paymentService.verifyPayment(request, userId));
    }
    @GetMapping("/history")
    public ResponseEntity<List<TransactionDTO>> getHistory(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(userId));
    }
    @PostMapping("/{transactionId}/refund")
    public ResponseEntity<TransactionDTO> refund(@PathVariable Long transactionId, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(paymentService.initiateRefund(transactionId, userId));
    }
    @GetMapping("/order/{orderId}")
    public ResponseEntity<TransactionDTO> getByOrder(@PathVariable Long orderId, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(paymentService.getTransactionByOrder(orderId, userId));
    }
}