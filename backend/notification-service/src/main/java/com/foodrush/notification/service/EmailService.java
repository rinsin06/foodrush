package com.foodrush.notification.service;
import com.foodrush.notification.event.OrderEvent;
import com.foodrush.notification.model.NotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {
    public void sendOrderConfirmation(NotificationEvent event) {
        log.info("Sending order confirmation email for: {}", event.getOrderNumber());
    }
    public void sendOrderStatusUpdate(NotificationEvent event, String message) {
        log.info("Sending status update '{}' for order: {}", message, event.getOrderNumber());
    }
    public void sendDeliveryConfirmation(NotificationEvent event) {
        log.info("Sending delivery confirmation for: {}", event.getOrderNumber());
    }
    public void sendOrderCancellation(NotificationEvent event) {
        log.info("Sending cancellation email for: {}", event.getOrderNumber());
    }
}
