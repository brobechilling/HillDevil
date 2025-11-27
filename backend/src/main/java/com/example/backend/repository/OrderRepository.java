package com.example.backend.repository;

import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("""
        SELECT o
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND o.status = :status
    """)
    List<Order> findAllByBranchIdAndStatus(@Param("branchId") UUID branchId,
                                           @Param("status") OrderStatus status);
    Optional<Order> findTopByAreaTable_AreaTableIdAndStatusOrderByUpdatedAtDesc(UUID areaTableId, OrderStatus status);

    // Analytics query methods

    /**
     * Count orders by branch, status, and timeframe
     */
    @Query("""
        SELECT COUNT(o)
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = true
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
    """)
    int countOrdersByBranchAndStatusAndTimeframe(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Calculate total revenue by branch and timeframe (COMPLETED orders only)
     */
    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0)
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = true
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
    """)
    BigDecimal sumRevenueByBranchAndTimeframe(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Find top selling items by branch and timeframe
     * Note: Limiting is handled in the service layer
     */
    @Query("""
        SELECT new com.example.backend.dto.TopSellingItemDTO(
            mi.menuItemId,
            mi.name,
            CAST(SUM(oi.quantity) AS int),
            SUM(oi.totalPrice)
        )
        FROM OrderItem oi
        JOIN oi.menuItem mi
        JOIN oi.orderLine ol
        JOIN ol.order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = true
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        AND oi.status = true
        GROUP BY mi.menuItemId, mi.name
        ORDER BY SUM(oi.totalPrice) DESC
    """)
    List<TopSellingItemDTO> findTopSellingItemsByBranch(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Get order distribution by hour for a specific date
     */
    @Query("""
        SELECT new com.example.backend.dto.OrderDistributionDTO(
            HOUR(o.createdAt),
            COUNT(o)
        )
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = true
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        GROUP BY HOUR(o.createdAt)
        ORDER BY HOUR(o.createdAt)
    """)
    List<OrderDistributionDTO> findOrderDistributionByBranchAndDate(
            @Param("branchId") UUID branchId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Find top selling items by restaurant and timeframe (aggregated from all branches)
     */
    @Query("""
        SELECT new com.example.backend.dto.TopSellingItemDTO(
            mi.menuItemId,
            mi.name,
            CAST(SUM(oi.quantity) AS int),
            SUM(oi.totalPrice)
        )
        FROM OrderItem oi
        JOIN oi.menuItem mi
        JOIN oi.orderLine ol
        JOIN ol.order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.restaurant.restaurantId = :restaurantId
        AND b.isActive = true
        AND a.status = true
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        AND oi.status = true
        GROUP BY mi.menuItemId, mi.name
        ORDER BY SUM(oi.totalPrice) DESC
    """)
    List<TopSellingItemDTO> findTopSellingItemsByRestaurant(
            @Param("restaurantId") UUID restaurantId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Get order distribution by hour for a restaurant (aggregated from all branches)
     */
    @Query("""
        SELECT new com.example.backend.dto.OrderDistributionDTO(
            HOUR(o.createdAt),
            COUNT(o)
        )
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.restaurant.restaurantId = :restaurantId
        AND b.isActive = true
        AND a.status = true
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        GROUP BY HOUR(o.createdAt)
        ORDER BY HOUR(o.createdAt)
    """)
    List<OrderDistributionDTO> findOrderDistributionByRestaurantAndDate(
            @Param("restaurantId") UUID restaurantId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );
}
