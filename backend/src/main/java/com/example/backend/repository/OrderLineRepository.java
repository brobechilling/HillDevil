package com.example.backend.repository;

import com.example.backend.entities.Branch;
import com.example.backend.entities.OrderLine;
import com.example.backend.entities.OrderLineStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderLineRepository extends JpaRepository<OrderLine, UUID> {
    
    List<OrderLine> findAllByOrder_OrderId(UUID orderId);
    List<OrderLine> findAllByOrderLineStatusAndOrder_AreaTable_Area_Branch(OrderLineStatus orderLineStatus, Branch branch);
}
