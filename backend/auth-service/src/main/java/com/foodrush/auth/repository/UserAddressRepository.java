package com.foodrush.auth.repository;


import com.foodrush.auth.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.userId = :userId")
    void clearDefaultForUser(Long userId);

    @Query("SELECT a FROM UserAddress a WHERE a.userId = :userId " +
            "AND a.city LIKE %:city% ORDER BY a.isDefault DESC")
    List<UserAddress> findByUserIdAndCity(Long userId, String city);
}
