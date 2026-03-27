package com.foodrush.auth.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken, refreshToken;
    @Builder.Default private String tokenType = "Bearer";
    private Long expiresIn;
    private UserDTO user;
}