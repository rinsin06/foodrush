package com.foodrush.auth.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.*;
@Slf4j
@Component
public class JwtTokenProvider {
    @Value("${app.jwt.secret}") private String jwtSecret;
    @Value("${app.jwt.expiration-ms}") private long jwtExpirationMs;
    @Value("${app.jwt.refresh-expiration-ms}") private long refreshExpirationMs;
    private Key getSigningKey() { return Keys.hmacShaKeyFor(jwtSecret.getBytes()); }
    public String generateAccessToken(Long userId, String email, List<String> roles) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setId(UUID.randomUUID().toString())   // optional but good
                .addClaims(Map.of(
                        "email", email,
                        "roles", roles,
                        "type", "access"
                ))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setId(UUID.randomUUID().toString())   // ⭐ ADD THIS
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims validateAndExtractClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }
    public boolean isTokenValid(String token) {
        try { validateAndExtractClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { log.warn("Invalid JWT: {}", e.getMessage()); return false; }
    }
    public Long getUserIdFromToken(String token) { return Long.parseLong(validateAndExtractClaims(token).getSubject()); }
    public String getEmailFromToken(String token) { return (String) validateAndExtractClaims(token).get("email"); }
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) { return (List<String>) validateAndExtractClaims(token).get("roles"); }
    public long getExpirationMs() { return jwtExpirationMs; }
}