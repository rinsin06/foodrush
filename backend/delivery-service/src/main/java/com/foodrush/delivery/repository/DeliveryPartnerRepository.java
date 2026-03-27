package com.foodrush.delivery.repository;

import com.foodrush.delivery.model.DeliveryPartner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {

    Optional<DeliveryPartner> findByUserId(Long userId);
    Optional<DeliveryPartner> findByEmail(String email);
    Optional<DeliveryPartner> findByPhone(String phone);

    List<DeliveryPartner> findByStatus(DeliveryPartner.PartnerStatus status);

    Page<DeliveryPartner> findAll(Pageable pageable);

    // Find nearest available partner using Haversine formula
    @Query(value = """
        SELECT *, (
            6371 * acos(
                cos(radians(:lat)) * cos(radians(current_lat)) *
                cos(radians(current_lng) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(current_lat))
            )
        ) AS distance
        FROM delivery_partners
        WHERE status = 'ONLINE'
        AND current_lat IS NOT NULL
        AND current_lng IS NOT NULL
        AND is_verified = true
        HAVING distance < :radiusKm
        ORDER BY distance ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<DeliveryPartner> findNearestAvailablePartners(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radiusKm") Double radiusKm,
        @Param("limit") int limit
    );

    long countByStatus(DeliveryPartner.PartnerStatus status);
}
