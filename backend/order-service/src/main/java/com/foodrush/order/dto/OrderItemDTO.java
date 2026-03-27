package com.foodrush.order.dto;
import com.foodrush.order.model.OrderItem;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private Long menuItemId;
    private String itemName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
    private Boolean isVeg;
    public static OrderItemDTO from(OrderItem item) {
        return OrderItemDTO.builder().id(item.getId()).menuItemId(item.getMenuItemId())
            .itemName(item.getItemName()).price(item.getPrice()).quantity(item.getQuantity())
            .totalPrice(item.getTotalPrice()).isVeg(item.getIsVeg()).build();
    }
}