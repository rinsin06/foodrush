package com.foodrush.delivery.repository;

import com.foodrush.delivery.model.DeliveryAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByOrderId(Long orderId);

    Optional<DeliveryAssignment> findByOrderIdAndPartnerId(Long orderId, Long partnerId);

    List<DeliveryAssignment> findByPartnerIdOrderByCreatedAtDesc(Long partnerId);

    Page<DeliveryAssignment> findByPartnerIdOrderByCreatedAtDesc(Long partnerId, Pageable pageable);

    List<DeliveryAssignment> findByPartnerIdAndStatus(Long partnerId, DeliveryAssignment.AssignmentStatus status);

    Optional<DeliveryAssignment> findByPartnerIdAndStatusIn(
        Long partnerId, List<DeliveryAssignment.AssignmentStatus> statuses
    );

    long countByPartnerId(Long partnerId);

    long countByPartnerIdAndStatus(Long partnerId, DeliveryAssignment.AssignmentStatus status);
}
