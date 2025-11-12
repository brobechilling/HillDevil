package com.example.backend.repository;

import com.example.backend.entities.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, UUID> {
    Optional<SubscriptionPayment> findByPayOsOrderCode(Long payOsOrderCode);

    boolean existsByPayOsOrderCode(long orderCode);

    List<SubscriptionPayment> findAllBySubscription_Restaurant_RestaurantIdOrderByDateDesc(UUID restaurantId);

    @Query(value = """
                SELECT
                    u.user_id AS user_id,
                    u.username AS username,
                    u.email AS email,
                    COALESCE(SUM(sp.amount), 0) AS total_spent
                FROM subscription_payment sp
                JOIN subscription s ON sp.subscription_id = s.subscription_id
                JOIN restaurant r ON s.restaurant_id = r.restaurant_id
                JOIN users u ON r.user_id = u.user_id
                WHERE sp.subscription_payment_status = 'SUCCESS'
                GROUP BY u.user_id, u.username, u.email
                ORDER BY total_spent DESC
                LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findTopSpenders(@Param("limit") int limit);
    List<SubscriptionPayment> findAllBySubscription_SubscriptionId(UUID subscriptionId);
}