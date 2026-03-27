package com.foodrush.admin.controller;

import com.foodrush.admin.dto.*;
import com.foodrush.admin.service.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    // GET all orders with optional status filter
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Object>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Orders fetched",
                adminOrderService.getAllOrders(page, size, status, token)));
    }

    // GET order by id
    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Object>> getOrderById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Order fetched",
                adminOrderService.getOrderById(id, token)));
    }

    // PUT force update order status
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<Object>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                adminOrderService.updateOrderStatus(id, request, token)));
    }

    // GET order statistics
    @GetMapping("/orders/stats")
    public ResponseEntity<ApiResponse<Object>> getOrderStats(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Stats fetched",
                adminOrderService.getOrderStats(token)));
    }

    // GET all coupons
    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<Object>> getAllCoupons(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched",
                adminOrderService.getAllCoupons(token)));
    }

    // POST create coupon
    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Object>> createCoupon(
            @Valid @RequestBody CreateCouponRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Coupon created",
                adminOrderService.createCoupon(request, token)));
    }

    // PUT update coupon
    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Object>> updateCoupon(
            @PathVariable Long id,
            @RequestBody CreateCouponRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Coupon updated",
                adminOrderService.updateCoupon(id, request, token)));
    }

    // PUT toggle coupon active/inactive
    @PutMapping("/coupons/{id}/toggle")
    public ResponseEntity<ApiResponse<Object>> toggleCoupon(
            @PathVariable Long id,
            @RequestParam boolean active,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Coupon toggled",
                adminOrderService.toggleCoupon(id, active, token)));
    }

    // DELETE coupon
    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        adminOrderService.deleteCoupon(id, token);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }
}
