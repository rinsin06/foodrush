package com.foodrush.auth.service;
import com.foodrush.auth.dto.*;
public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String accessToken);
    void logoutAll(Long userId);
    TokenValidationResponse validateToken(String token);
    UserDTO getUserProfile(Long userId);
    UserDTO updateProfile(Long userId, UserDTO dto);
    void changePassword(Long userId, ChangePasswordRequest request);
}