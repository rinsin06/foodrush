package com.foodrush.admin.service;

import com.foodrush.admin.config.AppConfig;
import com.foodrush.admin.dto.UpdateMenuItemRequest;
import com.foodrush.admin.dto.UpdateRestaurantRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRestaurantService {

    private final RestTemplate restTemplate;
    private final AppConfig appConfig;

    private HttpHeaders jsonHeaders(String adminToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (adminToken != null) headers.setBearerAuth(adminToken);
        return headers;
    }

    public Object getAllRestaurants(int page, int size, String status, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants?page=" + page + "&size=" + size
                + (status != null ? "&status=" + status : "");
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getRestaurantById(Long id, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + id;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object approveRestaurant(Long id, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + id + "/status";
        Map<String, String> body = Map.of("status", "OPEN");
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(body, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object rejectRestaurant(Long id, String reason, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + id + "/status";
        Map<String, String> body = Map.of("status", "TEMPORARILY_CLOSED", "reason", reason != null ? reason : "Rejected by admin");
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(body, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object updateRestaurantStatus(Long id, String status, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + id + "/status";
        Map<String, String> body = Map.of("status", status);
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(body, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object updateRestaurant(Long id, UpdateRestaurantRequest request, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + id;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(request, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public void deleteRestaurant(Long id, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + id;
        restTemplate.exchange(url, HttpMethod.DELETE,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
    }

    public Object getMenuByRestaurant(Long restaurantId, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants/" + restaurantId + "/menu";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object updateMenuItem(Long itemId, UpdateMenuItemRequest request, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/menu/" + itemId;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(request, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public void deleteMenuItem(Long itemId, String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/menu/" + itemId;
        restTemplate.exchange(url, HttpMethod.DELETE,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
    }

    public Object getPendingRestaurants(String token) {
        String url = appConfig.restaurantServiceUrl + "/api/v1/restaurants?status=PENDING_APPROVAL&size=100";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }
}
