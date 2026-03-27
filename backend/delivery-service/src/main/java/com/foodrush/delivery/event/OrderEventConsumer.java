package com.foodrush.delivery.event;

import com.foodrush.delivery.service.DeliveryPartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final DeliveryPartnerService deliveryService;

    @KafkaListener(topics = "order.events", groupId = "delivery-service-group")
    public void handleOrderEvent(OrderEvent event) {
        if (event == null || event.getEventType() == null) return;

        log.info("Received order event: {} for order {}", event.getEventType(), event.getOrderNumber());

        switch (event.getEventType()) {
            case "ORDER_PLACED" -> handleOrderPlaced(event);
            case "ORDER_CANCELLED" -> handleOrderCancelled(event);
            default -> log.debug("Ignoring event type: {}", event.getEventType());
        }
    }

    private void handleOrderPlaced(OrderEvent event) {
        try {
            deliveryService.createAssignment(
                event.getOrderId(),
                event.getOrderNumber(),
                event.getUserId(),
                event.getRestaurantId(),
                event.getRestaurantName(),
                event.getRestaurantAddress(),
                event.getDeliveryAddress(),
                event.getDeliveryLatitude(),
                event.getDeliveryLongitude(),
                event.getTotalAmount() != null ? event.getTotalAmount().doubleValue() : 0.0
            );
        } catch (Exception e) {
            log.error("Failed to create assignment for order {}: {}",
                event.getOrderNumber(), e.getMessage());
        }
    }

    private void handleOrderCancelled(OrderEvent event) {
        log.info("Order {} cancelled — no delivery needed", event.getOrderNumber());
        // Could mark assignment as CANCELLED here if needed
    }
}
