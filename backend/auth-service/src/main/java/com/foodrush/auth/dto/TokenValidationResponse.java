package com.foodrush.auth.dto;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TokenValidationResponse {
    private boolean valid; private String userId, email; private List<String> roles;
    public static TokenValidationResponse valid(String uid, String email, List<String> roles) {
        return TokenValidationResponse.builder().valid(true).userId(uid).email(email).roles(roles).build(); }
    public static TokenValidationResponse invalid() { return TokenValidationResponse.builder().valid(false).build(); }
}