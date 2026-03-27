package com.foodrush.restaurant.controller;

import com.foodrush.restaurant.dto.*;
import com.foodrush.restaurant.service.impl.MenuServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuServiceImpl menuService;

    /** GET /api/v1/restaurants/{restaurantId}/menu */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getMenu(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Boolean vegOnly) {
        if (Boolean.TRUE.equals(vegOnly)) {
            return ResponseEntity.ok(List.of(
                CategoryDTO.builder().name("Veg Items").menuItems(menuService.getMenuItems(restaurantId, true)).build()));
        }
        return ResponseEntity.ok(menuService.getMenuByRestaurant(restaurantId));
    }

    /** GET /api/v1/restaurants/{restaurantId}/menu/items */
    @GetMapping("/items")
    public ResponseEntity<List<MenuItemDTO>> getMenuItems(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Boolean vegOnly) {
        return ResponseEntity.ok(menuService.getMenuItems(restaurantId, vegOnly));
    }

    /** POST /api/v1/restaurants/{restaurantId}/menu/items */
    @PostMapping("/items")
    public ResponseEntity<MenuItemDTO> addMenuItem(
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuItemDTO dto,
            @RequestHeader("X-User-Id") Long userId) {
        dto.setRestaurantId(restaurantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.addMenuItem(restaurantId, dto, userId));
    }

    /** PUT /api/v1/restaurants/{restaurantId}/menu/items/{itemId} */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable Long restaurantId, @PathVariable Long itemId,
            @RequestBody MenuItemDTO dto,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(menuService.updateMenuItem(restaurantId, itemId, dto, userId));
    }

    /** DELETE /api/v1/restaurants/{restaurantId}/menu/items/{itemId} */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Map<String, String>> deleteMenuItem(
            @PathVariable Long restaurantId, @PathVariable Long itemId,
            @RequestHeader("X-User-Id") Long userId) {
        menuService.deleteMenuItem(restaurantId, itemId, userId);
        return ResponseEntity.ok(Map.of("message", "Menu item deleted"));
    }

    /** POST /api/v1/restaurants/{restaurantId}/menu/categories */
    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> addCategory(
            @PathVariable Long restaurantId,
            @RequestBody CategoryDTO dto,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.addCategory(restaurantId, dto, userId));
    }
}
