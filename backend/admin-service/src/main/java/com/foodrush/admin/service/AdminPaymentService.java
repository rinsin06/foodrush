package com.foodrush.admin.service;

import com.foodrush.admin.config.AppConfig;
import com.foodrush.admin.dto.RefundRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPaymentService {

    private final RestTemplate restTemplate;
    private final AppConfig appConfig;

    private HttpHeaders jsonHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) headers.setBearerAuth(token);
        return headers;
    }

    public Object getAllTransactions(int page, int size, String status, String token) {
        String url = appConfig.paymentServiceUrl + "/api/v1/payments/admin/all?page=" + page + "&size=" + size
                + (status != null ? "&status=" + status : "");
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getTransactionById(Long id, String token) {
        String url = appConfig.paymentServiceUrl + "/api/v1/payments/" + id;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getTransactionByOrder(Long orderId, String token) {
        String url = appConfig.paymentServiceUrl + "/api/v1/payments/order/" + orderId;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object initiateRefund(Long transactionId, RefundRequest request, String token) {
        String url = appConfig.paymentServiceUrl + "/api/v1/payments/" + transactionId + "/refund";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.POST,
                new HttpEntity<>(request, jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getPaymentStats(String token) {
        String url = appConfig.paymentServiceUrl + "/api/v1/payments/admin/stats";
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }

    public Object getRevenueReport(String from, String to, String token) {
        String url = appConfig.paymentServiceUrl + "/api/v1/payments/admin/revenue?from=" + from + "&to=" + to;
        ResponseEntity<Object> resp = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(jsonHeaders(token)), Object.class);
        return resp.getBody();
    }
}
