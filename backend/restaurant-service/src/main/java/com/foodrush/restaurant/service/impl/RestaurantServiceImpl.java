package com.foodrush.restaurant.service.impl;
import com.foodrush.restaurant.dto.RestaurantDTO;
import com.foodrush.restaurant.exception.*;
import com.foodrush.restaurant.model.*;
import com.foodrush.restaurant.repository.*;
import com.foodrush.restaurant.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {
    private final RestaurantRepository restaurantRepository;

    @Override @Transactional(readOnly = true)
    public Page<RestaurantDTO> getAllRestaurants(String city, Pageable pageable) {
        Page<Restaurant> r = city != null && !city.isBlank()
            ? restaurantRepository.findByCityAndStatus(city, Restaurant.RestaurantStatus.OPEN, pageable)
            : restaurantRepository.findAll(pageable);
        return r.map(RestaurantDTO::from);
    }

    @Override @Transactional(readOnly = true)
    public Page<RestaurantDTO> searchRestaurants(String query, Pageable pageable) {
        if (query == null || query.isBlank()) return getAllRestaurants(null, pageable);
        return restaurantRepository.searchRestaurants(query.trim(), pageable).map(RestaurantDTO::from);
    }

    @Override @Transactional(readOnly = true)
    public RestaurantDTO getRestaurantById(Long id) {
        return RestaurantDTO.from(restaurantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id)));
    }

    @Override @Transactional
    public RestaurantDTO createRestaurant(RestaurantDTO dto, Long ownerId) {
        Restaurant r = Restaurant.builder()
            .name(dto.getName()).description(dto.getDescription())
            .imageUrl(dto.getImageUrl()).coverImageUrl(dto.getCoverImageUrl())
            .address(dto.getAddress()).latitude(dto.getLatitude()).longitude(dto.getLongitude())
            .city(dto.getCity()).pincode(dto.getPincode())
            .minimumOrderAmount(dto.getMinimumOrderAmount() != null ? dto.getMinimumOrderAmount() : BigDecimal.valueOf(99))
            .deliveryFee(dto.getDeliveryFee() != null ? dto.getDeliveryFee() : BigDecimal.valueOf(40))
            .isVegOnly(dto.getIsVegOnly() != null ? dto.getIsVegOnly() : false)
            .isPureVeg(dto.getIsPureVeg() != null ? dto.getIsPureVeg() : false)
            .ownerId(ownerId).phone(dto.getPhone()).email(dto.getEmail())
            .fssaiLicense(dto.getFssaiLicense())
            .cuisines(dto.getCuisines() != null ? dto.getCuisines() : List.of())
            .status(Restaurant.RestaurantStatus.PENDING_APPROVAL).build();
        return RestaurantDTO.from(restaurantRepository.save(r));
    }

    @Override @Transactional
    public RestaurantDTO updateRestaurant(Long id, RestaurantDTO dto, Long requesterId) {
        Restaurant r = restaurantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        if (!r.getOwnerId().equals(requesterId)) throw new UnauthorizedException("Not authorized");
        if (dto.getName() != null) r.setName(dto.getName());
        if (dto.getDescription() != null) r.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null) r.setImageUrl(dto.getImageUrl());
        if (dto.getAddress() != null) r.setAddress(dto.getAddress());
        if (dto.getCity() != null) r.setCity(dto.getCity());
        if (dto.getCuisines() != null) r.setCuisines(dto.getCuisines());
        return RestaurantDTO.from(restaurantRepository.save(r));
    }

    @Override @Transactional
    public void deleteRestaurant(Long id) {
        if (!restaurantRepository.existsById(id)) throw new ResourceNotFoundException("Restaurant not found");
        restaurantRepository.deleteById(id);
    }

    @Override @Transactional(readOnly = true)
    public List<RestaurantDTO> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream().map(RestaurantDTO::from).collect(Collectors.toList());
    }

    @Override @Transactional
    public RestaurantDTO updateStatus(Long id, Restaurant.RestaurantStatus status, Long requesterId) {
        Restaurant r = restaurantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        r.setStatus(status); return RestaurantDTO.from(restaurantRepository.save(r));
    }

    @Override @Transactional(readOnly = true)
    public List<RestaurantDTO> findNearby(double latitude, double longitude, double radiusKm) {
        return restaurantRepository.findNearby(latitude, longitude, radiusKm).stream()
            .map(RestaurantDTO::from).collect(Collectors.toList());
    }
}