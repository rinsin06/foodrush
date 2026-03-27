package com.foodrush.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class UpdateRestaurantRequest {
    private String name;
    private String description;
    private String address;
    private String phone;
    private String email;
    private List<String> cuisines;
    private String status; // OPEN, CLOSED, TEMPORARILY_CLOSED, PENDING_APPROVAL
    private Double deliveryFee;
    private Integer estimatedDeliveryTime;
    private Double minimumOrderAmount;
}
