package com.foodrush.order.controller;

import com.foodrush.order.dto.*;
import com.foodrush.order.model.Order;
import com.foodrush.order.service.impl.OrderServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderServiceImpl orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(@Valid @RequestBody PlaceOrderRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(request, userId));
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getMyOrders(@RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(userId,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "placedAt"))));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Page<OrderDTO>> getAllOrdersAdmin(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "placedAt"))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.getOrderById(id, userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateStatus(@PathVariable Long id,
            @RequestParam Order.OrderStatus status, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, userId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "Cancelled by user") : "Cancelled by user";
        return ResponseEntity.ok(orderService.cancelOrder(id, userId, reason));
    }

    @GetMapping("/{id}/track")
    public ResponseEntity<OrderTrackingDTO> trackOrder(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        OrderDTO order = orderService.getOrderById(id, userId);
        var statusOrder = java.util.List.of("PLACED","CONFIRMED","PREPARING","READY_FOR_PICKUP","OUT_FOR_DELIVERY","DELIVERED");
        int currentIdx = statusOrder.indexOf(order.getStatus().name());
        var steps = java.util.List.of(
            OrderTrackingDTO.TrackingStep.builder().status("PLACED").label("Order Placed")
                .description("Your order has been placed").completed(currentIdx >= 0).build(),
            OrderTrackingDTO.TrackingStep.builder().status("CONFIRMED").label("Confirmed")
                .description("Restaurant confirmed").completed(currentIdx >= 1).build(),
            OrderTrackingDTO.TrackingStep.builder().status("PREPARING").label("Preparing")
                .description("Your food is being made").completed(currentIdx >= 2).build(),
            OrderTrackingDTO.TrackingStep.builder().status("OUT_FOR_DELIVERY").label("Out for Delivery")
                .description("On its way!").completed(currentIdx >= 4).build(),
            OrderTrackingDTO.TrackingStep.builder().status("DELIVERED").label("Delivered")
                .description("Enjoy your meal!").completed(currentIdx >= 5).build()
        );
        return ResponseEntity.ok(OrderTrackingDTO.builder()
            .orderNumber(order.getOrderNumber()).currentStatus(order.getStatus())
            .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
            .deliveryPersonName(order.getDeliveryPersonName())
            .deliveryPersonPhone(order.getDeliveryPersonPhone())
            .steps(steps).build());
    }
}
