package com.example.backend.repository;

import com.example.backend.entities.Branch;
import com.example.backend.entities.OrderLine;
import com.example.backend.entities.OrderLineStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OrderLineRepository extends JpaRepository<OrderLine, UUID> {
    
    List<OrderLine> findAllByOrder_OrderId(UUID orderId);
    List<OrderLine> findAllByOrderLineStatusAndOrder_AreaTable_Area_Branch(OrderLineStatus orderLineStatus, Branch branch);
    
    @Query("""
        SELECT ol FROM OrderLine ol
        WHERE ol.orderLineStatus = :status
          AND ol.order.areaTable.area.branch = :branch
          AND ol.createdAt BETWEEN :startOfDay AND :endOfDay
        ORDER BY ol.createdAt DESC
    """)
    List<OrderLine> findAllTodayByStatusAndBranch(
            @Param("status") OrderLineStatus status,
            @Param("branch") Branch branch,
            @Param("startOfDay") Instant startOfDay,
            @Param("endOfDay") Instant endOfDay
    );
}
