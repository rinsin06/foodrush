package com.foodrush.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterPartnerRequest {
    @NotBlank private String name;
    @NotBlank private String phone;
    @NotBlank private String vehicleType;
    private String vehicleNumber;
    private String profileImageUrl;
}
