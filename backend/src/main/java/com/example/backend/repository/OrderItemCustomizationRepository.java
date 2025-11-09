package com.example.backend.repository;

import com.example.backend.entities.OrderItemCustomization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderItemCustomizationRepository extends JpaRepository<OrderItemCustomization, UUID> {
}
