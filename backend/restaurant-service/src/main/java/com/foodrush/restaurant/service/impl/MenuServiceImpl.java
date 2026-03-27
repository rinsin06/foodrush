package com.foodrush.restaurant.service.impl;

import com.foodrush.restaurant.dto.CategoryDTO;
import com.foodrush.restaurant.dto.MenuItemDTO;


import com.foodrush.restaurant.model.Category;
import com.foodrush.restaurant.model.MenuItem;
import com.foodrush.restaurant.model.Restaurant;
import com.foodrush.restaurant.repository.CategoryRepository;
import com.foodrush.restaurant.repository.MenuItemRepository;
import com.foodrush.restaurant.repository.RestaurantRepository;


import com.foodrush.restaurant.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    // ─────────────────────────────────────────────────────────
    // GET FULL MENU BY RESTAURANT
    // ─────────────────────────────────────────────────────────
    @Override
    public List<CategoryDTO> getMenuByRestaurant(Long restaurantId) {

        List<Category> categories = categoryRepository
                .findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);

        return categories.stream().map(category -> {

            List<MenuItemDTO> items = menuItemRepository
                    .findByRestaurantIdAndIsAvailable(restaurantId, true)
                    .stream()
                    .filter(item -> item.getCategory().getId().equals(category.getId()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            return CategoryDTO.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .menuItems(items)
                    .build();
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // GET MENU ITEMS (OPTIONAL VEG FILTER)
    // ─────────────────────────────────────────────────────────
    @Override
    public List<MenuItemDTO> getMenuItems(Long restaurantId, Boolean vegOnly) {

        List<MenuItem> items;

        if (Boolean.TRUE.equals(vegOnly)) {
            items = menuItemRepository.findByRestaurantIdAndIsVeg(restaurantId, true);
        } else {
            items = menuItemRepository.findByRestaurantIdAndIsAvailable(restaurantId, true);
        }

        return items.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // ADD MENU ITEM
    // ─────────────────────────────────────────────────────────
    @Override
    public MenuItemDTO addMenuItem(Long restaurantId, MenuItemDTO dto, Long userId) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        MenuItem item = MenuItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .isVeg(dto.getIsVeg())
                .imageUrl(dto.getImageUrl())
                .isAvailable(true)
                .restaurant(restaurant)
                .category(category)
                .build();

        menuItemRepository.save(item);

        return mapToDTO(item);
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE MENU ITEM
    // ─────────────────────────────────────────────────────────
    @Override
    public MenuItemDTO updateMenuItem(Long restaurantId, Long itemId, MenuItemDTO dto, Long userId) {

        MenuItem item = menuItemRepository
                .findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setIsVeg(dto.getIsVeg());
        item.setImageUrl(dto.getImageUrl());

        menuItemRepository.save(item);

        return mapToDTO(item);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE MENU ITEM
    // ─────────────────────────────────────────────────────────
    @Override
    public void deleteMenuItem(Long restaurantId, Long itemId, Long userId) {

        MenuItem item = menuItemRepository
                .findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        menuItemRepository.delete(item);
    }

    // ─────────────────────────────────────────────────────────
    // ADD CATEGORY
    // ─────────────────────────────────────────────────────────
    @Override
    public CategoryDTO addCategory(Long restaurantId, CategoryDTO dto, Long userId) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Category category = Category.builder()
                .name(dto.getName())
                .restaurant(restaurant)
                .build();

        categoryRepository.save(category);

        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .menuItems(List.of())
                .build();
    }

    // ─────────────────────────────────────────────────────────
    // ENTITY → DTO MAPPER
    // ─────────────────────────────────────────────────────────
    private MenuItemDTO mapToDTO(MenuItem item) {

        return MenuItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .isVeg(item.getIsVeg())
                .isAvailable(item.getIsAvailable())
                .imageUrl(item.getImageUrl())
                .restaurantId(item.getRestaurant().getId())
                .categoryId(item.getCategory().getId())
                .build();
    }
}
