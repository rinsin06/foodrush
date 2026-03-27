package com.foodrush.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class AddressRequest {
    @NotBlank
    @Size(max = 50)
    private String label;

    @NotBlank
    @Size(max = 500)
    private String addressLine;

    @Size(max = 200)
    private String landmark;

    @Size(max = 100)
    private String city;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isDefault = false;
}