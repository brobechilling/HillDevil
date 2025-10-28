package com.example.backend.repository;

import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(UUID restaurantId);
    List<Subscription> findAllByStatus(SubscriptionStatus status);

    List<Subscription> findAllByaPackage_PackageId(UUID packageId);

    Optional<Subscription> findTopByRestaurant_RestaurantIdAndStatusOrderByCreatedAtDesc(
            UUID restaurantId,
            SubscriptionStatus status
    );

}