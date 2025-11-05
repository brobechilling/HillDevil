package com.example.backend.repository;

import com.example.backend.dto.OrderLineDTO;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderLineRepository extends JpaRepository<OrderLine, UUID> {
    List<OrderLine> findAllByOrder_OrderId(UUID orderId);

    UUID order(Order order);
}
