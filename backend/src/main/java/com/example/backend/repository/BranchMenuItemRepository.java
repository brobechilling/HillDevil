package com.example.backend.repository;

import com.example.backend.entities.BranchMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BranchMenuItemRepository extends JpaRepository<BranchMenuItem, UUID> {
    boolean existsByBranch_BranchIdAndMenuItem_MenuItemIdAndAvailableTrue(UUID branchId, UUID menuItemId);
    List<BranchMenuItem> findAllByBranch_BranchId(UUID branchId);
    @Query("SELECT b.restaurant.restaurantId FROM Branch b WHERE b.branchId = :branchId")
    UUID findRestaurantIdByBranchId(@Param("branchId") UUID branchId);
    Optional<BranchMenuItem> findByBranch_BranchIdAndMenuItem_MenuItemId(UUID branchId, UUID menuItemId);
}
