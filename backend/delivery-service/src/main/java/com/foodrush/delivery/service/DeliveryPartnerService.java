package com.foodrush.delivery.service;

import com.foodrush.delivery.dto.*;
import com.foodrush.delivery.event.DeliveryEvent;
import com.foodrush.delivery.exception.*;
import com.foodrush.delivery.model.*;
import com.foodrush.delivery.repository.*;
import com.foodrush.delivery.websocket.LocationBroadcaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryPartnerService {

    private final DeliveryPartnerRepository partnerRepo;
    private final DeliveryAssignmentRepository assignmentRepo;
    private final LocationUpdateRepository locationRepo;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final LocationBroadcaster locationBroadcaster;

    /* ── Registration ── */
    @Transactional
    public PartnerDTO registerPartner(Long userId, String email, RegisterPartnerRequest req) {
        if (partnerRepo.findByUserId(userId).isPresent())
            throw new BusinessException("Partner already registered for this user");
        return PartnerDTO.from(partnerRepo.save(DeliveryPartner.builder()
            .userId(userId).name(req.getName()).phone(req.getPhone()).email(email)
            .vehicleType(req.getVehicleType()).vehicleNumber(req.getVehicleNumber())
            .profileImageUrl(req.getProfileImageUrl())
            .status(DeliveryPartner.PartnerStatus.OFFLINE).isVerified(false).build()));
    }

    /* ── Profile ── */
    public PartnerDTO getMyProfile(Long userId) {
        return PartnerDTO.from(findByUserId(userId));
    }

    public PartnerDTO getPartnerById(Long id) {
        return PartnerDTO.from(partnerRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Partner not found")));
    }

    @Transactional
    public PartnerDTO updateProfile(Long userId, RegisterPartnerRequest req) {
        DeliveryPartner p = findByUserId(userId);
        if (req.getName()            != null) p.setName(req.getName());
        if (req.getPhone()           != null) p.setPhone(req.getPhone());
        if (req.getVehicleType()     != null) p.setVehicleType(req.getVehicleType());
        if (req.getVehicleNumber()   != null) p.setVehicleNumber(req.getVehicleNumber());
        if (req.getProfileImageUrl() != null) p.setProfileImageUrl(req.getProfileImageUrl());
        return PartnerDTO.from(partnerRepo.save(p));
    }

    /* ── Online/Offline ── */
    @Transactional
    public PartnerDTO goOnline(Long userId) {
        DeliveryPartner p = findByUserId(userId);
        if (!p.getIsVerified()) throw new BusinessException("Partner not verified yet");
        p.setStatus(DeliveryPartner.PartnerStatus.ONLINE);
        return PartnerDTO.from(partnerRepo.save(p));
    }

    @Transactional
    public PartnerDTO goOffline(Long userId) {
        DeliveryPartner p = findByUserId(userId);
        assignmentRepo.findByPartnerIdAndStatusIn(p.getId(),
            List.of(DeliveryAssignment.AssignmentStatus.ACCEPTED,
                    DeliveryAssignment.AssignmentStatus.PICKED_UP))
            .ifPresent(a -> { throw new BusinessException("Cannot go offline during active delivery"); });
        p.setStatus(DeliveryPartner.PartnerStatus.OFFLINE);
        return PartnerDTO.from(partnerRepo.save(p));
    }

    /* ── Location ── */
    @Transactional
    public void updateLocation(Long userId, LocationUpdateRequest req) {
        DeliveryPartner p = findByUserId(userId);
        p.setCurrentLat(req.getLatitude());
        p.setCurrentLng(req.getLongitude());
        p.setLastLocationUpdate(LocalDateTime.now());
        partnerRepo.save(p);

        if (req.getOrderId() != null) {
            assignmentRepo.findByOrderId(req.getOrderId()).ifPresent(a -> {
                boolean isActive = a.getPartnerId().equals(p.getId()) &&
                    (a.getStatus() == DeliveryAssignment.AssignmentStatus.ACCEPTED ||
                     a.getStatus() == DeliveryAssignment.AssignmentStatus.PICKED_UP);
                if (!isActive) return;

                locationRepo.save(LocationUpdate.builder()
                    .partnerId(p.getId()).assignmentId(a.getId())
                    .orderId(req.getOrderId())
                    .latitude(req.getLatitude()).longitude(req.getLongitude()).build());

                String msg = a.getStatus() == DeliveryAssignment.AssignmentStatus.ACCEPTED
                    ? p.getName() + " is heading to the restaurant"
                    : p.getName() + " is on the way to you";

                locationBroadcaster.broadcastLocation(req.getOrderId(), LiveLocationMessage.builder()
                    .partnerId(p.getId()).orderId(req.getOrderId())
                    .latitude(req.getLatitude()).longitude(req.getLongitude())
                    .partnerName(p.getName()).partnerPhone(p.getPhone())
                    .vehicleType(p.getVehicleType()).status(a.getStatus().name())
                    .trackingStatus(msg).timestamp(LocalDateTime.now()).build());
            });
        }
    }

    /* ── Accept ── */
    @Transactional
    public AssignmentDTO acceptOrder(Long userId, Long orderId) {
        DeliveryPartner p = findByUserId(userId);
        DeliveryAssignment a = getAssignment(orderId);
        validateOwnership(a, p);
        if (a.getStatus() != DeliveryAssignment.AssignmentStatus.PENDING)
            throw new BusinessException("Order is not pending");

        a.setStatus(DeliveryAssignment.AssignmentStatus.ACCEPTED);
        a.setAcceptedAt(LocalDateTime.now());
        a.setPartnerLatAtAccept(p.getCurrentLat());
        a.setPartnerLngAtAccept(p.getCurrentLng());
        p.setStatus(DeliveryPartner.PartnerStatus.BUSY);
        p.setCurrentOrderId(orderId);
        partnerRepo.save(p);

        DeliveryAssignment saved = assignmentRepo.save(a);
        publishEvent("DELIVERY_ACCEPTED", saved, p);
        broadcastStatus(orderId, p, "ACCEPTED",
            p.getName() + " accepted your order and is heading to the restaurant");
        return buildDTO(saved, p);
    }

    /* ── Picked Up ── */
    @Transactional
    public AssignmentDTO markPickedUp(Long userId, Long orderId) {
        DeliveryPartner p = findByUserId(userId);
        DeliveryAssignment a = getAssignment(orderId);
        validateOwnership(a, p);
        if (a.getStatus() != DeliveryAssignment.AssignmentStatus.ACCEPTED)
            throw new BusinessException("Order must be ACCEPTED to pick up");

        a.setStatus(DeliveryAssignment.AssignmentStatus.PICKED_UP);
        a.setPickedUpAt(LocalDateTime.now());
        DeliveryAssignment saved = assignmentRepo.save(a);
        publishEvent("ORDER_PICKED_UP", saved, p);
        broadcastStatus(orderId, p, "PICKED_UP",
            p.getName() + " picked up your order and is on the way!");
        return buildDTO(saved, p);
    }

    /* ── Delivered ── */
    @Transactional
    public AssignmentDTO markDelivered(Long userId, Long orderId) {
        DeliveryPartner p = findByUserId(userId);
        DeliveryAssignment a = getAssignment(orderId);
        validateOwnership(a, p);
        if (a.getStatus() != DeliveryAssignment.AssignmentStatus.PICKED_UP)
            throw new BusinessException("Order must be PICKED_UP to deliver");

        a.setStatus(DeliveryAssignment.AssignmentStatus.DELIVERED);
        a.setDeliveredAt(LocalDateTime.now());
        p.setStatus(DeliveryPartner.PartnerStatus.ONLINE);
        p.setCurrentOrderId(null);
        p.setTotalDeliveries(p.getTotalDeliveries() + 1);
        p.setTotalEarnings(p.getTotalEarnings() + a.getDeliveryFee());
        partnerRepo.save(p);

        DeliveryAssignment saved = assignmentRepo.save(a);
        publishEvent("ORDER_DELIVERED", saved, p);
        broadcastStatus(orderId, p, "DELIVERED", "Your order has been delivered! Enjoy your meal 🎉");
        return buildDTO(saved, p);
    }

    /* ── Reject ── */
    @Transactional
    public AssignmentDTO rejectOrder(Long userId, Long orderId, String reason) {
        DeliveryPartner p = findByUserId(userId);
        DeliveryAssignment a = getAssignment(orderId);
        validateOwnership(a, p);
        a.setStatus(DeliveryAssignment.AssignmentStatus.REJECTED);
        a.setRejectedAt(LocalDateTime.now());
        a.setRejectionReason(reason);
        DeliveryAssignment saved = assignmentRepo.save(a);
        publishEvent("DELIVERY_REJECTED", saved, p);
        return buildDTO(saved, p);
    }

    /* ── Assignment creation from Kafka ── */
    @Transactional
    public AssignmentDTO createAssignment(Long orderId, String orderNumber, Long userId,
                                          Long restaurantId, String restaurantName,
                                          String restaurantAddress, String deliveryAddress,
                                          Double deliveryLat, Double deliveryLng, Double totalAmount) {
        List<DeliveryPartner> available = (deliveryLat != null && deliveryLng != null)
            ? partnerRepo.findNearestAvailablePartners(deliveryLat, deliveryLng, 15.0, 5)
            : partnerRepo.findByStatus(DeliveryPartner.PartnerStatus.ONLINE);

        Long partnerId = available.isEmpty() ? -1L : available.get(0).getId();

        DeliveryAssignment saved = assignmentRepo.save(DeliveryAssignment.builder()
            .orderId(orderId).orderNumber(orderNumber).partnerId(partnerId).userId(userId)
            .restaurantId(restaurantId).restaurantName(restaurantName)
            .restaurantAddress(restaurantAddress).deliveryAddress(deliveryAddress)
            .deliveryLat(deliveryLat).deliveryLng(deliveryLng).totalAmount(totalAmount)
            .status(DeliveryAssignment.AssignmentStatus.PENDING)
            .assignedAt(LocalDateTime.now()).build());

        if (!available.isEmpty()) {
            DeliveryPartner p = available.get(0);
            locationBroadcaster.notifyPartner(p.getId(), LiveLocationMessage.builder()
                .orderId(orderId).status("PENDING")
                .trackingStatus("NEW_ORDER:" + orderNumber + "|" + deliveryAddress)
                .timestamp(LocalDateTime.now()).build());
            log.info("Order {} assigned to partner {}", orderNumber, p.getName());
            return buildDTO(saved, p);
        }

        log.warn("No available partners for order {}", orderNumber);
        return AssignmentDTO.from(saved);
    }

    /* ── Queries ── */
    public AssignmentDTO getAssignmentByOrderId(Long orderId) {
        DeliveryAssignment a = assignmentRepo.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("No assignment for order " + orderId));
        return buildDTO(a, partnerRepo.findById(a.getPartnerId()).orElse(null));
    }

    public List<AssignmentDTO> getMyDeliveries(Long userId, int page, int size) {
        DeliveryPartner p = findByUserId(userId);
        return assignmentRepo.findByPartnerIdOrderByCreatedAtDesc(p.getId(), PageRequest.of(page, size))
            .stream().map(a -> buildDTO(a, p)).collect(Collectors.toList());
    }

    public AssignmentDTO getMyCurrentDelivery(Long userId) {
        DeliveryPartner p = findByUserId(userId);
        return assignmentRepo.findByPartnerIdAndStatusIn(p.getId(),
                List.of(DeliveryAssignment.AssignmentStatus.ACCEPTED,
                        DeliveryAssignment.AssignmentStatus.PICKED_UP))
            .map(a -> buildDTO(a, p))
            .orElseThrow(() -> new ResourceNotFoundException("No active delivery"));
    }

    /* ── Admin ── */
    public Page<PartnerDTO> getAllPartners(Pageable pageable) {
        return partnerRepo.findAll(pageable).map(PartnerDTO::from);
    }

    @Transactional
    public PartnerDTO verifyPartner(Long id) {
        DeliveryPartner p = partnerRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        p.setIsVerified(true);
        return PartnerDTO.from(partnerRepo.save(p));
    }

    @Transactional
    public PartnerDTO unverifyPartner(Long id) {
        DeliveryPartner p = partnerRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        p.setIsVerified(false);
        p.setStatus(DeliveryPartner.PartnerStatus.OFFLINE);
        return PartnerDTO.from(partnerRepo.save(p));
    }

    public Map<String, Long> getStats() {
        return Map.of(
            "online",  partnerRepo.countByStatus(DeliveryPartner.PartnerStatus.ONLINE),
            "busy",    partnerRepo.countByStatus(DeliveryPartner.PartnerStatus.BUSY),
            "offline", partnerRepo.countByStatus(DeliveryPartner.PartnerStatus.OFFLINE),
            "total",   partnerRepo.count()
        );
    }

    /* ── Private helpers ── */
    private DeliveryPartner findByUserId(Long userId) {
        return partnerRepo.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Delivery partner profile not found"));
    }

    private DeliveryAssignment getAssignment(Long orderId) {
        return assignmentRepo.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    private void validateOwnership(DeliveryAssignment a, DeliveryPartner p) {
        if (!a.getPartnerId().equals(p.getId()))
            throw new BusinessException("This order is not assigned to you");
    }

    private AssignmentDTO buildDTO(DeliveryAssignment a, DeliveryPartner p) {
        AssignmentDTO dto = AssignmentDTO.from(a);
        if (p != null) {
            dto.setPartnerName(p.getName());
            dto.setPartnerPhone(p.getPhone());
            dto.setPartnerVehicle(p.getVehicleType());
            dto.setPartnerLat(p.getCurrentLat());
            dto.setPartnerLng(p.getCurrentLng());
        }
        return dto;
    }

    private void broadcastStatus(Long orderId, DeliveryPartner p, String status, String msg) {
        locationBroadcaster.broadcastLocation(orderId, LiveLocationMessage.builder()
            .partnerId(p.getId()).orderId(orderId)
            .latitude(p.getCurrentLat()).longitude(p.getCurrentLng())
            .partnerName(p.getName()).partnerPhone(p.getPhone())
            .vehicleType(p.getVehicleType()).status(status)
            .trackingStatus(msg).timestamp(LocalDateTime.now()).build());
    }

    private void publishEvent(String type, DeliveryAssignment a, DeliveryPartner p) {
        try {
            kafkaTemplate.send("delivery.events", String.valueOf(a.getOrderId()),
                DeliveryEvent.builder().eventType(type).orderId(a.getOrderId())
                    .orderNumber(a.getOrderNumber()).userId(a.getUserId())
                    .partnerId(p.getId()).partnerName(p.getName())
                    .partnerPhone(p.getPhone()).vehicleType(p.getVehicleType())
                    .partnerLat(p.getCurrentLat()).partnerLng(p.getCurrentLng())
                    .assignmentStatus(a.getStatus().name()).timestamp(LocalDateTime.now()).build());
        } catch (Exception e) {
            log.warn("Kafka publish failed (non-fatal): {}", e.getMessage());
        }
    }
}
