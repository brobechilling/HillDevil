package com.example.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Branch;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.RoleName;



@Repository
public interface StaffAccountRepository extends JpaRepository<StaffAccount, UUID> {
    Optional<StaffAccount> findByUsernameAndBranch(String username, Branch branch);
    Page<StaffAccount> findByBranchAndRole_NameNot(Branch branch, RoleName roleName ,Pageable pageable);
    long countByBranchAndRole_Name(Branch branch, RoleName roleName);
    Page<StaffAccount> findByBranch_Restaurant_RestaurantId(UUID restaurantId, Pageable pageable);
}
