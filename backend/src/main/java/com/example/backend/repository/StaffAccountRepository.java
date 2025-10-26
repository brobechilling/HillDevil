package com.example.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Branch;
import com.example.backend.entities.StaffAccount;

@Repository
public interface StaffAccountRepository extends JpaRepository<StaffAccount, UUID> {
    Optional<StaffAccount> findByUsernameAndBranch(String username, Branch branch);
}
