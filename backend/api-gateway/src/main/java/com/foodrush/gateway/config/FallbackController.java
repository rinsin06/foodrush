package com.foodrush.gateway.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/auth")
    public ResponseEntity<Map<String, Object>> authFallback() {
        return buildFallback("Auth Service is temporarily unavailable");
    }

    @RequestMapping("/restaurant")
    public ResponseEntity<Map<String, Object>> restaurantFallback() {
        return buildFallback("Restaurant Service is temporarily unavailable");
    }

    @RequestMapping("/order")
    public ResponseEntity<Map<String, Object>> orderFallback() {
        return buildFallback("Order Service is temporarily unavailable");
    }

    @RequestMapping("/payment")
    public ResponseEntity<Map<String, Object>> paymentFallback() {
        return buildFallback("Payment Service is temporarily unavailable");
    }

    @RequestMapping("/default")
    public ResponseEntity<Map<String, Object>> defaultFallback() {
        return buildFallback("Service is temporarily unavailable. Please try again later.");
    }

    private ResponseEntity<Map<String, Object>> buildFallback(String message) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status",    503,
            "error",     "Service Unavailable",
            "message",   message,
            "hint",      "The service may be starting up. Please retry in a few seconds."
        ));
    }
}
