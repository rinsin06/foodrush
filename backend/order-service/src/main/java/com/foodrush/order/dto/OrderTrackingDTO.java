package com.foodrush.order.dto;
import com.foodrush.order.model.Order;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderTrackingDTO {
    private String orderNumber;
    private Order.OrderStatus currentStatus;
    private LocalDateTime estimatedDeliveryTime;
    private String deliveryPersonName;
    private String deliveryPersonPhone;
    private List<TrackingStep> steps;
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TrackingStep {
        private String status;
        private String label;
        private String description;
        private boolean completed;
        private LocalDateTime completedAt;
    }
}