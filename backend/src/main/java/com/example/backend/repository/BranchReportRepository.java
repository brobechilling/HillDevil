package com.example.backend.repository;

import com.example.backend.entities.BranchReport;
import com.example.backend.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BranchReportRepository extends JpaRepository<BranchReport, UUID> {

    // Query directly from orders table for branch analytics
    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        JOIN o.areaTable at 
        JOIN at.area a 
        WHERE a.branch.branchId = :branchId 
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

    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0) 
        FROM Order o 
        JOIN o.areaTable at 
        JOIN at.area a 
        WHERE a.branch.branchId = :branchId 
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

    // Query for restaurant-wide branch performance
    @Query(value = """
        SELECT 
            b.branch_id as branchId,
            b.address as branchName,
            COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_price ELSE 0 END), 0) as totalRevenue,
            COUNT(CASE WHEN o.status = 'COMPLETED' THEN o.order_id ELSE NULL END) as totalOrders
        FROM branch b
        LEFT JOIN area a ON b.branch_id = a.branch_id AND a.status = true
        LEFT JOIN area_table at ON a.area_id = at.area_id
        LEFT JOIN orders o ON at.area_table_id = o.area_table_id
            AND o.created_at >= :startDate
            AND o.created_at < :endDate
        WHERE b.restaurant_id = :restaurantId
            AND b.is_active = true
        GROUP BY b.branch_id, b.address
        ORDER BY totalRevenue DESC
        """, nativeQuery = true)
    List<Object[]> getRestaurantBranchPerformance(
        @Param("restaurantId") UUID restaurantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    // Today's stats queries
    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0) 
        FROM Order o 
        JOIN o.areaTable at 
        JOIN at.area a 
        WHERE a.branch.branchId = :branchId 
        AND o.status = 'COMPLETED' 
        AND o.createdAt >= :startDate 
        AND o.createdAt < :endDate
        """)
    BigDecimal getTodayRevenue(
        @Param("branchId") UUID branchId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        JOIN o.areaTable at 
        JOIN at.area a 
        WHERE a.branch.branchId = :branchId 
        AND o.createdAt >= :startDate 
        AND o.createdAt < :endDate
        """)
    int getTodayTotalOrders(
        @Param("branchId") UUID branchId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        JOIN o.areaTable at 
        JOIN at.area a 
        WHERE a.branch.branchId = :branchId 
        AND o.status = 'COMPLETED' 
        AND o.createdAt >= :startDate 
        AND o.createdAt < :endDate
        """)
    int getTodayCompletedOrders(
        @Param("branchId") UUID branchId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0) 
        FROM OrderItem oi 
        JOIN oi.orderLine ol 
        JOIN ol.order o 
        JOIN o.areaTable at 
        JOIN at.area a 
        WHERE a.branch.branchId = :branchId 
        AND o.status = 'COMPLETED' 
        AND o.createdAt >= :startDate 
        AND o.createdAt < :endDate
        """)
    int getTotalMenuItemsSold(
        @Param("branchId") UUID branchId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );
}
