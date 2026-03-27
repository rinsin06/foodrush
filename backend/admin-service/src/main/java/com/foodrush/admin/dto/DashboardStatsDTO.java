package com.foodrush.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalUsers;
    private long totalRestaurants;
    private long totalOrders;
    private long totalRevenue;
    private long pendingRestaurantApprovals;
    private long activeUsers;
    private long ordersToday;
    private double revenueToday;
}
