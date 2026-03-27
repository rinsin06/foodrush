package com.foodrush.admin.controller;

import com.foodrush.admin.dto.ApiResponse;
import com.foodrush.admin.dto.DashboardStatsDTO;
import com.foodrush.admin.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminUserService adminUserService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats(
            @RequestHeader("Authorization") String authHeader) {

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .totalUsers(adminUserService.getTotalUsers())
                .activeUsers(adminUserService.getActiveUsers())
                // Restaurant, order, payment counts would come from their services
                // For now returns user stats — extend by calling other services
                .totalRestaurants(0L)
                .totalOrders(0L)
                .totalRevenue(0L)
                .pendingRestaurantApprovals(0L)
                .ordersToday(0L)
                .revenueToday(0.0)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", stats));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Admin service is running", "OK"));
    }
}
