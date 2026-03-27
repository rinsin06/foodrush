package com.foodrush.order.controller;
import com.foodrush.order.dto.*;
import com.foodrush.order.service.impl.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final OrderServiceImpl orderService;
    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAvailableCoupons() {
        return ResponseEntity.ok(orderService.getAvailableCoupons());
    }
    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @RequestParam String code, @RequestParam BigDecimal orderAmount,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.validateCoupon(code, orderAmount, userId));
    }

    @PostMapping
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO request) {
        return ResponseEntity.ok(orderService.createCoupon(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponDTO> updateCoupon(@PathVariable Long id, @RequestBody CouponDTO request) {
        return ResponseEntity.ok(orderService.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        orderService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<CouponDTO> toggleCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.toggleCoupon(id));
    }
}
