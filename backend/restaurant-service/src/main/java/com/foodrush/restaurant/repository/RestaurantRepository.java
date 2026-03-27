package com.foodrush.restaurant.repository;
import com.foodrush.restaurant.model.Restaurant;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Page<Restaurant> findByCityAndStatus(String city, Restaurant.RestaurantStatus status, Pageable pageable);
    @Query("SELECT DISTINCT r FROM Restaurant r WHERE (LOWER(r.name) LIKE LOWER(CONCAT('%',:query,'%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%',:query,'%'))) AND r.status = 'OPEN'")
    Page<Restaurant> searchRestaurants(@Param("query") String query, Pageable pageable);
    List<Restaurant> findByOwnerId(Long ownerId);
    @Query(value = "SELECT * FROM restaurants r WHERE r.status = 'OPEN' AND (6371 * ACOS(COS(RADIANS(:lat)) * COS(RADIANS(r.latitude)) * COS(RADIANS(r.longitude) - RADIANS(:lng)) + SIN(RADIANS(:lat)) * SIN(RADIANS(r.latitude)))) < :radiusKm ORDER BY r.rating DESC", nativeQuery = true)
    List<Restaurant> findNearby(@Param("lat") double latitude, @Param("lng") double longitude, @Param("radiusKm") double radiusKm);
    Optional<Restaurant> findByIdAndOwnerId(Long id, Long ownerId);
    boolean existsByOwnerIdAndName(Long ownerId, String name);
}