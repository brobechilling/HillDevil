package com.example.backend.repository;

import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.backend.entities.Package;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    List<Subscription> findAllByStatus(SubscriptionStatus status);

    Optional<Subscription> findTopByRestaurant_RestaurantIdAndStatusOrderByCreatedAtDesc(
            UUID restaurantId,
            SubscriptionStatus status);

    List<Subscription> findAllByRestaurant_RestaurantId(UUID restaurantId);

    @Query("""
                SELECT s.aPackage
                FROM Subscription s
                WHERE s.restaurant.restaurantId = :restaurantId
                  AND s.status = 'ACTIVE'
            """)
    Optional<Package> findActivePackageByRestaurantId(UUID restaurantId);

    long countByRestaurant_RestaurantId(UUID restaurantId);

    @Query("""
            SELECT DISTINCT s
            FROM Subscription s
            JOIN FETCH s.aPackage p
            LEFT JOIN FETCH s.subscriptionPayments pay
            """)
    List<Subscription> findAllWithPayments();
}