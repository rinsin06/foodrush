package com.foodrush.order.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Order order;
    @Column(name = "menu_item_id", nullable = false)
    private Long menuItemId;
    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    @Column(nullable = false)
    private Integer quantity;
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;
    @Column(name = "is_veg")
    private Boolean isVeg;
    @PrePersist @PreUpdate
    public void calculateTotal() {
        this.totalPrice = price.multiply(BigDecimal.valueOf(quantity));
    }
}