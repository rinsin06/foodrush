package com.foodrush.restaurant.model;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
@Entity @Table(name = "categories")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String name;
    private String description;
    @Builder.Default @Column(name = "display_order") private Integer displayOrder = 0;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "restaurant_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private Restaurant restaurant;
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @Builder.Default private List<MenuItem> menuItems = new ArrayList<>();
}