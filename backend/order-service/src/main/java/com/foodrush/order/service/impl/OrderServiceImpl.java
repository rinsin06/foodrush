package com.foodrush.order.service.impl;

import com.foodrush.order.dto.*;
import com.foodrush.order.event.*;
import com.foodrush.order.exception.*;
import com.foodrush.order.model.*;
import com.foodrush.order.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl {
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final OrderEventPublisher eventPublisher;
    private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0.05);
    private static final BigDecimal BASE_DELIVERY_FEE = BigDecimal.valueOf(40);
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = BigDecimal.valueOf(299);

    @Transactional
    public OrderDTO placeOrder(PlaceOrderRequest request, Long userId) {
        try {
            BigDecimal discountAmount = BigDecimal.ZERO;
            Coupon appliedCoupon = null;

            if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
                appliedCoupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode())
                        .orElseThrow(() -> new BusinessException("Invalid coupon code"));
                if (!appliedCoupon.isValid()) throw new BusinessException("Coupon has expired");
                Long usage = orderRepository.countUserCouponUsage(userId, request.getCouponCode());
                if (usage >= appliedCoupon.getMaxUsesPerUser()) throw new BusinessException("Coupon already used");
            }

            log.info("Step 1 - Coupon validation passed");

            BigDecimal subtotal = request.getItems().stream()
                    .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (appliedCoupon != null) discountAmount = appliedCoupon.calculateDiscount(subtotal);
            BigDecimal deliveryFee = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0 ? BigDecimal.ZERO : BASE_DELIVERY_FEE;
            BigDecimal taxableAmount = subtotal.subtract(discountAmount);
            BigDecimal taxAmount = taxableAmount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = taxableAmount.add(deliveryFee).add(taxAmount);

            log.info("Step 2 - Totals calculated: subtotal={}, total={}", subtotal, totalAmount);

            Order order = Order.builder()
                    .orderNumber(generateOrderNumber()).userId(userId)
                    .restaurantId(request.getRestaurantId()).restaurantName(request.getRestaurantName())
                    .deliveryAddress(request.getDeliveryAddress())
                    .deliveryLatitude(request.getDeliveryLatitude()).deliveryLongitude(request.getDeliveryLongitude())
                    .paymentMethod(request.getPaymentMethod()).specialInstructions(request.getSpecialInstructions())
                    .subtotal(subtotal).deliveryFee(deliveryFee).discountAmount(discountAmount)
                    .taxAmount(taxAmount).totalAmount(totalAmount).couponCode(request.getCouponCode())
                    .paymentStatus(
                    request.getPaymentMethod() == Order.PaymentMethod.CASH_ON_DELIVERY
                            ? Order.PaymentStatus.PENDING
                            : Order.PaymentStatus.PAID
                    )
                    .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(35)).build();

            log.info("Step 3 - Order object built: {}", order.getOrderNumber());

            List<OrderItem> orderItems = request.getItems().stream()
                    .map(i -> OrderItem.builder().order(order).menuItemId(i.getMenuItemId())
                            .itemName(i.getItemName()).price(i.getPrice()).quantity(i.getQuantity()).isVeg(i.getIsVeg()).build())
                    .collect(Collectors.toList());
            order.setItems(orderItems);

            log.info("Step 4 - Order items built: {} items", orderItems.size());

            Order savedOrder = orderRepository.save(order);

            log.info("Step 5 - Order saved with id: {}", savedOrder.getId());

            if (appliedCoupon != null) {
                appliedCoupon.setUsedCount(appliedCoupon.getUsedCount() + 1);
                couponRepository.save(appliedCoupon);
            }

            log.info("Step 6 - Coupon updated");

            try {
                eventPublisher.publishOrderEvent(OrderEvent.builder()
                        .eventType("ORDER_PLACED").orderId(savedOrder.getId())
                        .orderNumber(savedOrder.getOrderNumber()).userId(userId)
                        .restaurantId(savedOrder.getRestaurantId()).restaurantName(savedOrder.getRestaurantName())
                        .status(savedOrder.getStatus()).totalAmount(savedOrder.getTotalAmount())
                        .deliveryAddress(savedOrder.getDeliveryAddress()).timestamp(LocalDateTime.now()).build());
                log.info("Step 7 - Kafka event published");
            } catch (Exception kafkaEx) {
                // Kafka failure should NOT fail the order
                log.warn("Step 7 - Kafka publish failed (non-fatal): {}", kafkaEx.getMessage());
            }

            log.info("Order placed successfully: {} for user {}", savedOrder.getOrderNumber(), userId);
            return OrderDTO.from(savedOrder);

        } catch (BusinessException e) {
            log.error("Business error placing order: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("UNEXPECTED ERROR placing order at step - message: {}", e.getMessage());
            log.error("Full stack trace: ", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId, pageable).map(OrderDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        try {
            return orderRepository.findAll(pageable)
                    .map(OrderDTO::from);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch orders", e);
        }
    }


    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id, Long userId) {
        return OrderDTO.from(orderRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus newStatus, Long requesterId) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.canTransitionTo(newStatus))
            throw new BusinessException("Cannot transition from " + order.getStatus() + " to " + newStatus);
        order.setStatus(newStatus);
        if (newStatus == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        }
        Order updated = orderRepository.save(order);
        eventPublisher.publishOrderEvent(OrderEvent.builder()
            .eventType("ORDER_" + newStatus.name()).orderId(updated.getId())
            .orderNumber(updated.getOrderNumber()).userId(updated.getUserId())
            .restaurantId(updated.getRestaurantId()).status(updated.getStatus())
            .timestamp(LocalDateTime.now()).build());
        return OrderDTO.from(updated);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id, Long userId, String reason) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.isCancellable())
            throw new BusinessException("Cannot cancel order at status: " + order.getStatus());
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(reason);
        Order cancelled = orderRepository.save(order);
        eventPublisher.publishOrderEvent(OrderEvent.builder().eventType("ORDER_CANCELLED")
            .orderId(cancelled.getId()).orderNumber(cancelled.getOrderNumber()).userId(userId)
            .status(Order.OrderStatus.CANCELLED).timestamp(LocalDateTime.now()).build());
        return OrderDTO.from(cancelled);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount, Long userId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        if (!coupon.isValid()) return CouponValidationResponse.invalid("Coupon is expired");
        if (orderAmount.compareTo(coupon.getMinimumOrderAmount()) < 0)
            return CouponValidationResponse.invalid("Min order amount: Rs." + coupon.getMinimumOrderAmount());
        Long usage = orderRepository.countUserCouponUsage(userId, code);
        if (usage >= coupon.getMaxUsesPerUser()) return CouponValidationResponse.invalid("Coupon already used");
        return CouponValidationResponse.valid(coupon.calculateDiscount(orderAmount), coupon.getDescription());
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> getAvailableCoupons() {
        return couponRepository.findByIsActiveTrue().stream().filter(Coupon::isValid)
            .map(CouponDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public CouponDTO createCoupon(CouponDTO request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase().trim())
                .description(request.getDescription())
                .discountType(Coupon.DiscountType.valueOf(request.getDiscountType()))
                .discountValue(new BigDecimal(String.valueOf(request.getDiscountValue())))
                .maxDiscountAmount(request.getMaxDiscountAmount() != null
                        ? new BigDecimal(String.valueOf(request.getMaxDiscountAmount())) : null)
                .minimumOrderAmount(request.getMinimumOrderAmount() != null
                        ? new BigDecimal(String.valueOf(request.getMinimumOrderAmount())) : BigDecimal.ZERO)
                .maxUses(request.getMaxUses())
                .maxUsesPerUser(request.getMaxUsesPerUser() != null ? request.getMaxUsesPerUser() : 1)
                .usedCount(0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .build();
        return CouponDTO.from(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDTO updateCoupon(Long id, CouponDTO request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setCode(request.getCode().toUpperCase().trim());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(request.getDiscountType()));
        coupon.setDiscountValue(new BigDecimal(String.valueOf(request.getDiscountValue())));
        if (request.getMaxDiscountAmount() != null)
            coupon.setMaxDiscountAmount(new BigDecimal(String.valueOf(request.getMaxDiscountAmount())));
        if (request.getMinimumOrderAmount() != null)
            coupon.setMinimumOrderAmount(new BigDecimal(String.valueOf(request.getMinimumOrderAmount())));
        coupon.setMaxUses(request.getMaxUses());
        if (request.getMaxUsesPerUser() != null) coupon.setMaxUsesPerUser(request.getMaxUsesPerUser());
        coupon.setIsActive(request.getIsActive());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        return CouponDTO.from(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        couponRepository.delete(coupon);
    }

    @Transactional
    public CouponDTO toggleCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setIsActive(!coupon.getIsActive());
        return CouponDTO.from(couponRepository.save(coupon));
    }

    private String generateOrderNumber() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String unique = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return String.format("FR-%s-%s", datePrefix, unique);
    }
}
