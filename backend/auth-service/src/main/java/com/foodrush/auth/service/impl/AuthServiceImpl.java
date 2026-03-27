package com.foodrush.auth.service.impl;
import com.foodrush.auth.dto.*;
import com.foodrush.auth.exception.*;
import com.foodrush.auth.model.*;
import com.foodrush.auth.repository.*;
import com.foodrush.auth.security.JwtTokenProvider;
import com.foodrush.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j @Service @RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final RedisTemplate<String, String> redisTemplate;
    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:";

    @Override @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BusinessException("Email is already registered");
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone()))
            throw new BusinessException("Phone number is already registered");
        Role.RoleName roleName = switch (request.getRole().toUpperCase()) {
            case "RESTAURANT" -> Role.RoleName.ROLE_RESTAURANT;
            case "ADMIN" -> Role.RoleName.ROLE_ADMIN;
            default -> Role.RoleName.ROLE_USER;
        };
        Role role = roleRepository.findByName(roleName)
            .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        User user = User.builder().name(request.getName()).email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone()).status(User.UserStatus.ACTIVE).build();
        user.getRoles().add(role);
        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getEmail());
        return buildAuthResponse(savedUser);
    }

    @Override @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            User user = userRepository.findByEmailWithRoles(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            if (user.getStatus() == User.UserStatus.BLOCKED)
                throw new BusinessException("Your account has been blocked.");
            return buildAuthResponse(user);
        } catch (BadCredentialsException e) { throw new UnauthorizedException("Invalid email or password"); }
        catch (DisabledException e) { throw new UnauthorizedException("Account is disabled"); }
    }

    @Override @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (stored.getRevoked() || stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }
        User user = stored.getUser();
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return buildAuthResponse(user);
    }

    @Override @Transactional
    public void logout(String accessToken) {
        if (jwtTokenProvider.isTokenValid(accessToken)) {
            Long userId = jwtTokenProvider.getUserIdFromToken(accessToken);
            redisTemplate.opsForValue().set(TOKEN_BLACKLIST_PREFIX + accessToken, userId.toString(),
                jwtTokenProvider.getExpirationMs(), TimeUnit.MILLISECONDS);
        }
    }

    @Override @Transactional
    public void logoutAll(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Override
    public TokenValidationResponse validateToken(String token) {
        Boolean isBlacklisted = redisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + token);
        if (Boolean.TRUE.equals(isBlacklisted)) return TokenValidationResponse.invalid();
        if (!jwtTokenProvider.isTokenValid(token)) return TokenValidationResponse.invalid();
        return TokenValidationResponse.valid(
            jwtTokenProvider.getUserIdFromToken(token).toString(),
            jwtTokenProvider.getEmailFromToken(token),
            jwtTokenProvider.getRolesFromToken(token));
    }

    @Override @Transactional(readOnly = true)
    public UserDTO getUserProfile(Long userId) {
        return UserDTO.from(userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Override @Transactional
    public UserDTO updateProfile(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getProfileImageUrl() != null) user.setProfileImageUrl(dto.getProfileImageUrl());
        return UserDTO.from(userRepository.save(user));
    }

    @Override @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new BusinessException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUser(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        List<String> roles = user.getRoles().stream().map(r -> r.getName().name()).toList();
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        RefreshToken rt = RefreshToken.builder().token(refreshToken).user(user)
            .expiryDate(Instant.now().plusSeconds(604800)).build();
        refreshTokenRepository.save(rt);
        return AuthResponse.builder().accessToken(accessToken).refreshToken(refreshToken)
            .expiresIn(jwtTokenProvider.getExpirationMs()).user(UserDTO.from(user)).build();
    }
}