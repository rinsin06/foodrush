package com.foodrush.payment.repository;
import com.foodrush.payment.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Transaction> findByOrderIdAndUserId(Long orderId, Long userId);
    Optional<Transaction> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Transaction> findByOrderId(Long orderId);
}