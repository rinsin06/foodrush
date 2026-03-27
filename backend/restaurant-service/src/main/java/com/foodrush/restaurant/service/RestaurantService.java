package com.foodrush.restaurant.service;
import com.foodrush.restaurant.dto.RestaurantDTO;
import com.foodrush.restaurant.model.Restaurant;
import org.springframework.data.domain.*;
import java.util.List;
public interface RestaurantService {
    Page<RestaurantDTO> getAllRestaurants(String city, Pageable pageable);
    Page<RestaurantDTO> searchRestaurants(String query, Pageable pageable);
    RestaurantDTO getRestaurantById(Long id);
    RestaurantDTO createRestaurant(RestaurantDTO dto, Long ownerId);
    RestaurantDTO updateRestaurant(Long id, RestaurantDTO dto, Long requesterId);
    void deleteRestaurant(Long id);
    List<RestaurantDTO> getRestaurantsByOwner(Long ownerId);
    RestaurantDTO updateStatus(Long id, Restaurant.RestaurantStatus status, Long requesterId);
    List<RestaurantDTO> findNearby(double latitude, double longitude, double radiusKm);
}