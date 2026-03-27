package com.foodrush.order.repository;
import com.foodrush.order.model.Order;
import lombok.extern.log4j.Log4j;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAll(Pageable pageable);
    Page<Order> findByUserIdOrderByPlacedAtDesc(Long userId, Pageable pageable);
    Page<Order> findByRestaurantIdOrderByPlacedAtDesc(Long restaurantId, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId AND o.couponCode = :couponCode AND o.paymentStatus = 'PAID'")
    Long countUserCouponUsage(@Param("userId") Long userId, @Param("couponCode") String couponCode);
//    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(order_number, 12) AS UNSIGNED)), 0) " +
//            "FROM orders WHERE order_number LIKE CONCAT('FR-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')",
//            nativeQuery = true)
//    BigDecimal findMaxOrderSequence();  // ← MUST be BigDecimal not Long
}