package com.example.backend.repository;

import com.example.backend.entities.BranchMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BranchMenuItemRepository extends JpaRepository<BranchMenuItem, UUID> {
    boolean existsByBranch_BranchIdAndMenuItem_MenuItemIdAndAvailableTrue(UUID branchId, UUID menuItemId);
    Optional<BranchMenuItem> findByBranch_BranchIdAndMenuItem_MenuItemId(UUID branchId, UUID menuItemId);
    List<BranchMenuItem> findAllByBranch_BranchId(UUID branchId);
    List<BranchMenuItem> findByBranch_BranchId(UUID branchId);
}
