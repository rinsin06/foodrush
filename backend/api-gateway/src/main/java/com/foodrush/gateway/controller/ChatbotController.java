package com.foodrush.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/message")
    public ResponseEntity<Object> chat(@RequestBody Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "llama-3.3-70b-versatile");
        payload.put("max_tokens", 1024);
        payload.put("messages", buildMessages(body));

        ResponseEntity<Object> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                new HttpEntity<>(payload, headers),
                Object.class
        );
        return ResponseEntity.ok(response.getBody());
    }

    private List<Map<String, String>> buildMessages(Map<String, Object> body) {
        List<Map<String, String>> messages = new ArrayList<>();
        // Add system prompt as first message
        if (body.containsKey("system")) {
            messages.add(Map.of("role", "system", "content", body.get("system").toString()));
        }
        // Add conversation history
        messages.addAll((List<Map<String, String>>) body.get("messages"));
        return messages;
    }
}
