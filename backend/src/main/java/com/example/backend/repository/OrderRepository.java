package com.example.backend.repository;

import com.example.backend.entities.Order;
import com.example.backend.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
