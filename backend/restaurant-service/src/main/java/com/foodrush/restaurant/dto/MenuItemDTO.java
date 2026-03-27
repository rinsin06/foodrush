package com.foodrush.restaurant.dto;
import com.foodrush.restaurant.model.MenuItem;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MenuItemDTO {
    private Long id;
    @NotBlank(message = "Item name is required") @Size(min=2, max=150) private String name;
    private String description;
    @NotNull(message = "Price is required") @DecimalMin("0.01") private BigDecimal price;
    private BigDecimal discountedPrice;
    private String imageUrl;
    private Boolean isVeg, isAvailable, isBestseller;
    private Integer calories, preparationTimeMinutes;
    private BigDecimal rating;
    @NotNull(message = "Restaurant ID is required") private Long restaurantId;
    private Long categoryId; private String categoryName;

    public static MenuItemDTO from(MenuItem item) {
        return MenuItemDTO.builder()
            .id(item.getId()).name(item.getName()).description(item.getDescription())
            .price(item.getPrice()).discountedPrice(item.getDiscountedPrice())
            .imageUrl(item.getImageUrl()).isVeg(item.getIsVeg())
            .isAvailable(item.getIsAvailable()).isBestseller(item.getIsBestseller())
            .calories(item.getCalories()).preparationTimeMinutes(item.getPreparationTimeMinutes())
            .rating(item.getRating()).restaurantId(item.getRestaurant().getId())
            .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
            .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
            .build();
    }
}