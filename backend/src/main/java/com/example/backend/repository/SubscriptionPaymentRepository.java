package com.example.backend.repository;

import com.example.backend.entities.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, UUID> {
    Optional<SubscriptionPayment> findByPayOsOrderCode(Long payOsOrderCode);
}