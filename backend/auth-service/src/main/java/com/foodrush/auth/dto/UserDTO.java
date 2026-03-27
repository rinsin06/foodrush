package com.foodrush.auth.dto;
import com.foodrush.auth.model.User;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name, email, phone, profileImageUrl;
    private List<String> roles;
    private User.UserStatus status;
    private LocalDateTime createdAt;
    public static UserDTO from(User u) {
        return UserDTO.builder().id(u.getId()).name(u.getName()).email(u.getEmail())
            .phone(u.getPhone()).profileImageUrl(u.getProfileImageUrl())
            .status(u.getStatus()).createdAt(u.getCreatedAt())
            .roles(u.getRoles().stream().map(r -> r.getName().name().replace("ROLE_","")).toList()).build();
    }
}