package com.foodrush.restaurant.controller;

import com.foodrush.restaurant.dto.RestaurantDTO;
import com.foodrush.restaurant.model.Restaurant;
import com.foodrush.restaurant.service.RestaurantService;
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
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    /** GET /api/v1/restaurants - List all restaurants */
    @GetMapping
    public ResponseEntity<Page<RestaurantDTO>> getAllRestaurants(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating,desc") String sort) {
        String[] sortParts = sort.split(",");
        Sort sortObj = Sort.by(
            sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortParts[0]);
        return ResponseEntity.ok(restaurantService.getAllRestaurants(city, PageRequest.of(page, size, sortObj)));
    }

    /** GET /api/v1/restaurants/search */
    @GetMapping("/search")
    public ResponseEntity<Page<RestaurantDTO>> searchRestaurants(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(query, PageRequest.of(page, size)));
    }

    /** GET /api/v1/restaurants/nearby */
    @GetMapping("/nearby")
    public ResponseEntity<List<RestaurantDTO>> getNearbyRestaurants(
            @RequestParam double lat, @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radius) {
        return ResponseEntity.ok(restaurantService.findNearby(lat, lng, radius));
    }

    /** GET /api/v1/restaurants/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    /** POST /api/v1/restaurants */
    @PostMapping
    public ResponseEntity<RestaurantDTO> createRestaurant(
            @Valid @RequestBody RestaurantDTO dto,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurant(dto, userId));
    }

    /** PUT /api/v1/restaurants/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantDTO> updateRestaurant(
            @PathVariable Long id, @RequestBody RestaurantDTO dto,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, dto, userId));
    }

    /** DELETE /api/v1/restaurants/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok(Map.of("message", "Restaurant deleted"));
    }

    /** GET /api/v1/restaurants/my */
    @GetMapping("/my")
    public ResponseEntity<List<RestaurantDTO>> getMyRestaurants(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(userId));
    }

    /** PATCH /api/v1/restaurants/{id}/status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<RestaurantDTO> updateStatus(
            @PathVariable Long id, @RequestParam Restaurant.RestaurantStatus status,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(restaurantService.updateStatus(id, status, userId));
    }
}
