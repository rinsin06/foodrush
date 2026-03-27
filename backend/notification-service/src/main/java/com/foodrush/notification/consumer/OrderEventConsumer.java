package com.foodrush.notification.consumer;

import com.foodrush.notification.event.OrderEvent;
import com.foodrush.notification.model.NotificationEvent;
import com.foodrush.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final EmailService emailService;

    @KafkaListener(
        topics = "foodrush.orders",
        groupId = "notification-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeOrderEvent(NotificationEvent event, Acknowledgment ack) {
        log.info("Received order event: {} for order {}",
            event.getEventType(), event.getOrderNumber());

        try {
            switch (event.getEventType()) {
                case "ORDER_PLACED" ->
                    emailService.sendOrderConfirmation(event);
                case "ORDER_CONFIRMED" ->
                    emailService.sendOrderStatusUpdate(event, "Your order has been confirmed! 👍");
                case "ORDER_PREPARING" ->
                    emailService.sendOrderStatusUpdate(event, "Chef is preparing your food 👨‍🍳");
                case "OUT_FOR_DELIVERY" ->
                    emailService.sendOrderStatusUpdate(event, "Your order is on the way! 🛵");
                case "ORDER_DELIVERED" ->
                    emailService.sendDeliveryConfirmation(event);
                case "ORDER_CANCELLED" ->
                    emailService.sendOrderCancellation(event);
                default ->
                    log.warn("Unknown event type: {}", event.getEventType());
            }
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
            throw e;
        }
    }
}
