package com.foodrush.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private boolean available;
    private boolean vegetarian;
    private boolean vegan;
    private String imageUrl;
}
