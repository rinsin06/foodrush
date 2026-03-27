package com.foodrush.restaurant.dto;
import com.foodrush.restaurant.model.Restaurant;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RestaurantDTO {
    private Long id;
    @NotBlank(message = "Restaurant name is required") @Size(min=2, max=150) private String name;
    private String description, imageUrl, coverImageUrl;
    @NotBlank(message = "Address is required") private String address;
    private Double latitude, longitude;
    private String city, pincode;
    private BigDecimal rating;
    private Integer totalRatings, avgDeliveryTimeMinutes;
    private BigDecimal minimumOrderAmount, deliveryFee;
    private Restaurant.RestaurantStatus status;
    private Boolean isVegOnly, isPureVeg;
    private Long ownerId;
    private String phone, email, fssaiLicense;
    private List<String> cuisines;
    private List<CategoryDTO> categories;
    private LocalDateTime createdAt;
    private Boolean isOpen;
    private String deliveryTime;

    public static RestaurantDTO from(Restaurant r) {
        return RestaurantDTO.builder()
            .id(r.getId()).name(r.getName()).description(r.getDescription())
            .imageUrl(r.getImageUrl()).coverImageUrl(r.getCoverImageUrl())
            .address(r.getAddress()).latitude(r.getLatitude()).longitude(r.getLongitude())
            .city(r.getCity()).pincode(r.getPincode()).rating(r.getRating())
            .totalRatings(r.getTotalRatings()).avgDeliveryTimeMinutes(r.getAvgDeliveryTimeMinutes())
            .minimumOrderAmount(r.getMinimumOrderAmount()).deliveryFee(r.getDeliveryFee())
            .status(r.getStatus()).isVegOnly(r.getIsVegOnly()).isPureVeg(r.getIsPureVeg())
            .ownerId(r.getOwnerId()).phone(r.getPhone()).email(r.getEmail())
            .cuisines(r.getCuisines()).createdAt(r.getCreatedAt())
            .isOpen(r.getStatus() == Restaurant.RestaurantStatus.OPEN)
            .deliveryTime(r.getAvgDeliveryTimeMinutes() + "-" + (r.getAvgDeliveryTimeMinutes() + 10) + " min")
            .build();
    }
}