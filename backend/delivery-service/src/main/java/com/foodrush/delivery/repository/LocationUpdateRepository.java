package com.foodrush.delivery.repository;

import com.foodrush.delivery.model.LocationUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationUpdateRepository extends JpaRepository<LocationUpdate, Long> {
    List<LocationUpdate> findTop50ByOrderIdOrderByRecordedAtDesc(Long orderId);
    void deleteByOrderId(Long orderId);
}
