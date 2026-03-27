package com.foodrush.delivery.websocket;

import com.foodrush.delivery.dto.LiveLocationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocationBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts live location to users tracking an order.
     * Frontend subscribes to: /topic/tracking/{orderId}
     */
    public void broadcastLocation(Long orderId, LiveLocationMessage message) {
        String destination = "/topic/tracking/" + orderId;
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Broadcast location for order {} → lat:{} lng:{}",
            orderId, message.getLatitude(), message.getLongitude());
    }

    /**
     * Sends a new order notification to a specific delivery partner.
     * Partner subscribes to: /queue/partner/{partnerId}
     */
    public void notifyPartner(Long partnerId, LiveLocationMessage message) {
        String destination = "/queue/partner/" + partnerId;
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Notified partner {} of new order {}", partnerId, message.getOrderId());
    }
}
