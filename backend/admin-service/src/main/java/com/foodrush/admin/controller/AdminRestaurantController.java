package com.foodrush.admin.controller;

import com.foodrush.admin.dto.*;
import com.foodrush.admin.service.AdminRestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/restaurants")
@RequiredArgsConstructor
public class AdminRestaurantController {

    private final AdminRestaurantService adminRestaurantService;

    // GET all restaurants with optional status filter
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Restaurants fetched",
                adminRestaurantService.getAllRestaurants(page, size, status, token)));
    }

    // GET restaurants pending approval
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Object>> getPendingRestaurants(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Pending restaurants fetched",
                adminRestaurantService.getPendingRestaurants(token)));
    }

    // GET restaurant by id
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getRestaurantById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Restaurant fetched",
                adminRestaurantService.getRestaurantById(id, token)));
    }

    // PUT approve restaurant
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Object>> approveRestaurant(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Restaurant approved",
                adminRestaurantService.approveRestaurant(id, token)));
    }

    // PUT reject restaurant
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Object>> rejectRestaurant(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.success("Restaurant rejected",
                adminRestaurantService.rejectRestaurant(id, reason, token)));
    }

    // PUT update restaurant status (OPEN, CLOSED, TEMPORARILY_CLOSED)
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                adminRestaurantService.updateRestaurantStatus(id, body.get("status"), token)));
    }

    // PUT edit restaurant details
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateRestaurant(
            @PathVariable Long id,
            @RequestBody UpdateRestaurantRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated",
                adminRestaurantService.updateRestaurant(id, request, token)));
    }

    // DELETE restaurant permanently
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRestaurant(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        adminRestaurantService.deleteRestaurant(id, token);
        return ResponseEntity.ok(ApiResponse.success("Restaurant deleted", null));
    }

    // GET menu items for a restaurant
    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<ApiResponse<Object>> getMenu(
            @PathVariable Long restaurantId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Menu fetched",
                adminRestaurantService.getMenuByRestaurant(restaurantId, token)));
    }

    // PUT edit menu item
    @PutMapping("/menu/{itemId}")
    public ResponseEntity<ApiResponse<Object>> updateMenuItem(
            @PathVariable Long itemId,
            @RequestBody UpdateMenuItemRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success("Menu item updated",
                adminRestaurantService.updateMenuItem(itemId, request, token)));
    }

    // DELETE menu item
    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(
            @PathVariable Long itemId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        adminRestaurantService.deleteMenuItem(itemId, token);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted", null));
    }
}
