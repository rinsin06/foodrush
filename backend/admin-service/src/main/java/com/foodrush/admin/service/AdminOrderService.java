package com.foodrush.admin.service;

import com.foodrush.admin.config.AppConfig;
import com.foodrush.admin.dto.CreateCouponRequest;
import com.foodrush.admin.dto.UpdateOrderStatusRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final RestTemplate restTemplate;
    private final AppConfig appConfig;

    private HttpHeaders jsonHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) headers.setBearerAuth(token);
        return headers;
    }

    public Object getAllOrders(int page, int size, String status, String token) {
        try {
            String url = appConfig.orderServiceUrl + "/api/v1/orders/admin/all?page=" + page + "&size=" + size
                    + (status != null ? "&status=" + status : "");

            ResponseEntity<Object> resp = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(jsonHeaders(token)),
                    Object.class
            );

            return resp.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to fetch orders: " + e.getMessage();
        }
    }
    public Object getOrderById(Long id, String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/orders/" + id;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object updateOrderStatus(Long id, UpdateOrderStatusRequest request, String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/orders/" + id + "/status";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(request, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getOrderStats(String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/orders/admin/stats";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getAllCoupons(String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/coupons";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object createCoupon(CreateCouponRequest request, String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/coupons";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.POST,
                new HttpEntity<>(request, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object updateCoupon(Long couponId, CreateCouponRequest request, String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/coupons/" + couponId;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(request, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public void deleteCoupon(Long couponId, String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/coupons/" + couponId;
        restTemplate.exchange(url, HttpMethod.DELETE,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
    }

    public Object toggleCoupon(Long couponId, boolean active, String token) {
        String url = appConfig.orderServiceUrl + "/api/v1/coupons/" + couponId + "/toggle?active=" + active;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.PUT,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }
}
