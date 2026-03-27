package com.foodrush.delivery.controller;

import com.foodrush.delivery.dto.*;
import com.foodrush.delivery.service.DeliveryPartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryPartnerController {

    private final DeliveryPartnerService service;

    /* ── Partner Registration & Profile ── */

    /** POST /api/v1/delivery/register
     *  Register current user as a delivery partner */
    @PostMapping("/register")
    public ResponseEntity<PartnerDTO> register(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody RegisterPartnerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registerPartner(userId, email, req));
    }

    /** GET /api/v1/delivery/me — get my partner profile */
    @GetMapping("/me")
    public ResponseEntity<PartnerDTO> getMyProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getMyProfile(userId));
    }

    /** PUT /api/v1/delivery/me — update my profile */
    @PutMapping("/me")
    public ResponseEntity<PartnerDTO> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody RegisterPartnerRequest req) {
        return ResponseEntity.ok(service.updateProfile(userId, req));
    }

    /* ── Online/Offline Toggle ── */

    /** PATCH /api/v1/delivery/me/online */
    @PatchMapping("/me/online")
    public ResponseEntity<PartnerDTO> goOnline(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.goOnline(userId));
    }

    /** PATCH /api/v1/delivery/me/offline */
    @PatchMapping("/me/offline")
    public ResponseEntity<PartnerDTO> goOffline(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.goOffline(userId));
    }

    /* ── Location Updates ── */

    /** POST /api/v1/delivery/location — partner sends GPS every 3–5 seconds */
    @PostMapping("/location")
    public ResponseEntity<Void> updateLocation(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody LocationUpdateRequest req) {
        service.updateLocation(userId, req);
        return ResponseEntity.ok().build();
    }

    /* ── Assignment Actions ── */

    /** POST /api/v1/delivery/orders/{orderId}/accept */
    @PostMapping("/orders/{orderId}/accept")
    public ResponseEntity<AssignmentDTO> acceptOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(service.acceptOrder(userId, orderId));
    }

    /** POST /api/v1/delivery/orders/{orderId}/pickup */
    @PostMapping("/orders/{orderId}/pickup")
    public ResponseEntity<AssignmentDTO> markPickedUp(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(service.markPickedUp(userId, orderId));
    }

    /** POST /api/v1/delivery/orders/{orderId}/deliver */
    @PostMapping("/orders/{orderId}/deliver")
    public ResponseEntity<AssignmentDTO> markDelivered(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(service.markDelivered(userId, orderId));
    }

    /** POST /api/v1/delivery/orders/{orderId}/reject */
    @PostMapping("/orders/{orderId}/reject")
    public ResponseEntity<AssignmentDTO> rejectOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "Rejected by partner") String reason) {
        return ResponseEntity.ok(service.rejectOrder(userId, orderId, reason));
    }

    /* ── Delivery History ── */

    /** GET /api/v1/delivery/my-deliveries */
    @GetMapping("/my-deliveries")
    public ResponseEntity<List<AssignmentDTO>> getMyDeliveries(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getMyDeliveries(userId, page, size));
    }

    /** GET /api/v1/delivery/current — current active delivery */
    @GetMapping("/current")
    public ResponseEntity<AssignmentDTO> getCurrentDelivery(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getMyCurrentDelivery(userId));
    }

    /* ── User Tracking (called by customer to track their order) ── */

    /** GET /api/v1/delivery/track/{orderId} */
    @GetMapping("/track/{orderId}")
    public ResponseEntity<AssignmentDTO> trackOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.getAssignmentByOrderId(orderId));
    }

    /* ── Admin endpoints ── */

    /** GET /api/v1/delivery/admin/partners */
    @GetMapping("/admin/partners")
    public ResponseEntity<Page<PartnerDTO>> getAllPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAllPartners(PageRequest.of(page, size)));
    }

    /** GET /api/v1/delivery/admin/partners/{id} */
    @GetMapping("/admin/partners/{id}")
    public ResponseEntity<PartnerDTO> getPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPartnerById(id));
    }

    /** PATCH /api/v1/delivery/admin/partners/{id}/verify */
    @PatchMapping("/admin/partners/{id}/verify")
    public ResponseEntity<PartnerDTO> verifyPartner(@PathVariable Long id) {
        return ResponseEntity.ok(service.verifyPartner(id));
    }

    /** PATCH /api/v1/delivery/admin/partners/{id}/unverify */
    @PatchMapping("/admin/partners/{id}/unverify")
    public ResponseEntity<PartnerDTO> unverifyPartner(@PathVariable Long id) {
        return ResponseEntity.ok(service.unverifyPartner(id));
    }

    /** GET /api/v1/delivery/admin/stats */
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(service.getStats());
    }
}
