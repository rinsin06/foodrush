package com.foodrush.restaurant.model;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "restaurants")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 150) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "image_url") private String imageUrl;
    @Column(name = "cover_image_url") private String coverImageUrl;
    @Column(nullable = false, length = 300) private String address;
    private Double latitude, longitude;
    @Column(length = 100) private String city;
    @Column(length = 10) private String pincode;
    @Column(precision = 3, scale = 1) private BigDecimal rating;
    @Builder.Default @Column(name = "total_ratings") private Integer totalRatings = 0;
    @Builder.Default @Column(name = "avg_delivery_time_minutes") private Integer avgDeliveryTimeMinutes = 30;
    @Builder.Default @Column(name = "minimum_order_amount", precision = 10, scale = 2) private BigDecimal minimumOrderAmount = BigDecimal.valueOf(99);
    @Builder.Default @Column(name = "delivery_fee", precision = 10, scale = 2) private BigDecimal deliveryFee = BigDecimal.valueOf(40);
    @Enumerated(EnumType.STRING) @Builder.Default @Column(nullable = false) private RestaurantStatus status = RestaurantStatus.OPEN;
    @Builder.Default @Column(name = "is_veg_only") private Boolean isVegOnly = false;
    @Builder.Default @Column(name = "is_pure_veg") private Boolean isPureVeg = false;
    @Column(name = "owner_id", nullable = false) private Long ownerId;
    @Column(length = 15) private String phone;
    @Column(length = 150) private String email;
    @Column(name = "fssai_license", length = 50) private String fssaiLicense;
    @ElementCollection @CollectionTable(name = "restaurant_cuisines", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "cuisine") @Builder.Default private List<String> cuisines = new ArrayList<>();
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default private List<Category> categories = new ArrayList<>();
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default private List<MenuItem> menuItems = new ArrayList<>();
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    public enum RestaurantStatus { OPEN, CLOSED, TEMPORARILY_CLOSED, PENDING_APPROVAL }
}