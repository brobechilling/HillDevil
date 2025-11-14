package com.example.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;  
import org.springframework.data.jpa.repository.Query;       
import org.springframework.data.repository.query.Param;

import com.example.backend.entities.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    List<Branch> findByRestaurant_RestaurantId(UUID restaurantId);
    List<Branch> findByRestaurant_RestaurantIdAndIsActiveTrue(UUID restaurantId);
    @Modifying
    @Query("UPDATE Branch b SET b.isActive = false, b.updatedAt = CURRENT_TIMESTAMP WHERE b.restaurant.restaurantId = :restaurantId")
    void deactivateAllByRestaurantId(@Param("restaurantId") UUID restaurantId);

    @Query("SELECT b.restaurant.restaurantId FROM Branch b WHERE b.branchId = :branchId")
    Optional<UUID> findRestaurantIdByBranchId(@Param("branchId") UUID branchId);

    long countByRestaurant_RestaurantId(UUID restaurantId);

    @Query("SELECT b FROM Branch b WHERE b.restaurant.user.userId = :ownerId")
    List<Branch> findByOwnerId(@Param("ownerId") UUID ownerId);
}
