package com.foodrush.admin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${app.services.auth-url}")
    public String authServiceUrl;

    @Value("${app.services.restaurant-url}")
    public String restaurantServiceUrl;

    @Value("${app.services.order-url}")
    public String orderServiceUrl;

    @Value("${app.services.payment-url}")
    public String paymentServiceUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
