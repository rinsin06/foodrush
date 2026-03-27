package com.foodrush.restaurant.repository;
import com.foodrush.restaurant.model.MenuItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantIdAndIsAvailable(Long restaurantId, Boolean isAvailable);
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsVeg(Long restaurantId, Boolean isVeg);
    Optional<MenuItem> findByIdAndRestaurantId(Long id, Long restaurantId);
    @Query("SELECT m FROM MenuItem m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%',:query,'%')) AND m.isAvailable = true")
    List<MenuItem> searchAllMenus(@Param("query") String query);
}