package com.foodrush.delivery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class LocationUpdateRequest {
    @NotNull private Double latitude;
    @NotNull private Double longitude;
    private Long orderId;
}
