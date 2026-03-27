package com.foodrush.restaurant.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "menu_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 150) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(name = "discounted_price", precision = 10, scale = 2) private BigDecimal discountedPrice;
    @Column(name = "image_url") private String imageUrl;
    @Builder.Default @Column(name = "is_veg", nullable = false) private Boolean isVeg = true;
    @JsonProperty("isAvailable")
    @Builder.Default
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;    @Builder.Default @Column(name = "is_bestseller") private Boolean isBestseller = false;
    private Integer calories;
    @Builder.Default @Column(name = "preparation_time_minutes") private Integer preparationTimeMinutes = 15;
    @Column(precision = 3, scale = 1) private BigDecimal rating;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "restaurant_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private Restaurant restaurant;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "category_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude private Category category;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    public BigDecimal getEffectivePrice() {
        return (discountedPrice != null && discountedPrice.compareTo(BigDecimal.ZERO) > 0) ? discountedPrice : price; }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public Boolean getIsVeg() {
        return isVeg;
    }

    public Boolean getIsBestseller() {
        return isBestseller;
    }
}