package com.foodrush.restaurant.service;

import com.foodrush.restaurant.dto.CategoryDTO;
import com.foodrush.restaurant.dto.MenuItemDTO;

import java.util.List;

public interface MenuService {

    // ─────────────────────────────────────────
    // GET FULL MENU GROUPED BY CATEGORY
    // ─────────────────────────────────────────
    List<CategoryDTO> getMenuByRestaurant(Long restaurantId);

    // ─────────────────────────────────────────
    // GET MENU ITEMS (OPTIONAL VEG FILTER)
    // ─────────────────────────────────────────
    List<MenuItemDTO> getMenuItems(Long restaurantId, Boolean vegOnly);

    // ─────────────────────────────────────────
    // ADD MENU ITEM
    // ─────────────────────────────────────────
    MenuItemDTO addMenuItem(Long restaurantId, MenuItemDTO dto, Long userId);

    // ─────────────────────────────────────────
    // UPDATE MENU ITEM
    // ─────────────────────────────────────────
    MenuItemDTO updateMenuItem(Long restaurantId, Long itemId, MenuItemDTO dto, Long userId);

    // ─────────────────────────────────────────
    // DELETE MENU ITEM
    // ─────────────────────────────────────────
    void deleteMenuItem(Long restaurantId, Long itemId, Long userId);

    // ─────────────────────────────────────────
    // ADD CATEGORY
    // ─────────────────────────────────────────
    CategoryDTO addCategory(Long restaurantId, CategoryDTO dto, Long userId);
}
