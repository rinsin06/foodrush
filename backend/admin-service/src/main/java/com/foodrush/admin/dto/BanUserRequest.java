package com.foodrush.admin.dto;

import lombok.Data;

@Data
public class BanUserRequest {
    private String status; // ACTIVE, INACTIVE, BLOCKED, PENDING_VERIFICATION
    private String reason;
}