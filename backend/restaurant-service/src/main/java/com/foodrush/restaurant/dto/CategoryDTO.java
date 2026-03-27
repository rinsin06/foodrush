package com.foodrush.restaurant.dto;
import com.foodrush.restaurant.model.Category;
import com.foodrush.restaurant.model.MenuItem;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryDTO {
    private Long id; private String name, description;
    private Integer displayOrder; private Long restaurantId;
    private List<MenuItemDTO> menuItems;

    public static CategoryDTO from(Category category) {
        return CategoryDTO.builder()
            .id(category.getId()).name(category.getName()).description(category.getDescription())
            .displayOrder(category.getDisplayOrder()).restaurantId(category.getRestaurant().getId())
            .menuItems(category.getMenuItems().stream().filter(MenuItem::getIsAvailable)
                .map(MenuItemDTO::from).collect(Collectors.toList()))
            .build();
    }
}