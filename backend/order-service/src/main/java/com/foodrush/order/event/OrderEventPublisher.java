package com.foodrush.order.event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;
    private static final String ORDER_TOPIC = "foodrush.orders";
    public void publishOrderEvent(OrderEvent event) {
        log.info("Publishing {} for order {}", event.getEventType(), event.getOrderNumber());
        kafkaTemplate.send(ORDER_TOPIC, event.getOrderNumber(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) log.error("Failed to publish event: {}", ex.getMessage());
            });
    }
}