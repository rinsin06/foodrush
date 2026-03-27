package com.foodrush.admin.dto;

import lombok.Data;

@Data
public class RefundRequest {
    private String reason;
    private Double amount; // null = full refund
}
