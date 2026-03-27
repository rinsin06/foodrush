package com.foodrush.restaurant.repository;
import com.foodrush.restaurant.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
    Optional<Category> findByIdAndRestaurantId(Long id, Long restaurantId);
    boolean existsByRestaurantIdAndName(Long restaurantId, String name);
}