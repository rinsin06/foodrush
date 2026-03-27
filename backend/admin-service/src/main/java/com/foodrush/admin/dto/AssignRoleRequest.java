package com.foodrush.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignRoleRequest {
    @NotBlank
    private String role; // ROLE_USER, ROLE_ADMIN, ROLE_RESTAURANT
}
