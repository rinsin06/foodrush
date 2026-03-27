package com.foodrush.auth.model;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name = "roles")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Enumerated(EnumType.STRING) @Column(nullable = false, unique = true) private RoleName name;
    public enum RoleName { ROLE_USER, ROLE_ADMIN, ROLE_RESTAURANT }
}
