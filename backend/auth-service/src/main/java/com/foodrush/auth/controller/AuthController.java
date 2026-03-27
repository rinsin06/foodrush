package com.foodrush.auth.controller;
import com.foodrush.auth.dto.*;
import com.foodrush.auth.exception.UnauthorizedException;
import com.foodrush.auth.security.JwtTokenProvider;
import com.foodrush.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Slf4j @RestController @RequestMapping("/api/v1/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        authService.logout(extractToken(authHeader));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAll(@RequestHeader("Authorization") String authHeader) {
        authService.logoutAll(jwtTokenProvider.getUserIdFromToken(extractToken(authHeader)));
        return ResponseEntity.ok(Map.of("message", "All sessions terminated"));
    }

    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validate(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.validateToken(extractToken(authHeader)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getProfile(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.getUserProfile(jwtTokenProvider.getUserIdFromToken(extractToken(authHeader))));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(authService.updateProfile(jwtTokenProvider.getUserIdFromToken(extractToken(authHeader)), dto));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(jwtTokenProvider.getUserIdFromToken(extractToken(authHeader)), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "auth-service"));
    }

    private String extractToken(String header) {
        if (header == null || !header.startsWith("Bearer "))
            throw new UnauthorizedException("Missing or invalid Authorization header");
        return header.substring(7);
    }
}