package com.foodrush.admin.controller;

import com.foodrush.admin.dto.*;
import com.foodrush.admin.service.AdminPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    // GET all transactions
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Transactions fetched",
                adminPaymentService.getAllTransactions(page, size, status, token)));
    }

    // GET transaction by id
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getTransactionById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Transaction fetched",
                adminPaymentService.getTransactionById(id, token)));
    }

    // GET transaction by order id
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<Object>> getByOrderId(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Transaction fetched",
                adminPaymentService.getTransactionByOrder(orderId, token)));
    }

    // POST initiate refund
    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<Object>> refund(
            @PathVariable Long id,
            @RequestBody(required = false) RefundRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (request == null) request = new RefundRequest();
        return ResponseEntity.ok(ApiResponse.success("Refund initiated",
                adminPaymentService.initiateRefund(id, request, token)));
    }

    // GET payment statistics
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Stats fetched",
                adminPaymentService.getPaymentStats(token)));
    }

    // GET revenue report between dates
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Object>> getRevenue(
            @RequestParam String from,
            @RequestParam String to,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Revenue report fetched",
                adminPaymentService.getRevenueReport(from, to, token)));
    }
}
