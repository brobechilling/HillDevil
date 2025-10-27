package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    List<Branch> findByRestaurant_RestaurantId(UUID restaurantId);
}
