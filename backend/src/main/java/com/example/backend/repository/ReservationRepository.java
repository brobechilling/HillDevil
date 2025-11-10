package com.example.backend.repository;

import java.util.UUID;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    Page<Reservation> findAllByBranch_BranchId(UUID branchId, Pageable pageable);
    List<Reservation> findAllByAreaTable_AreaTableId(UUID areaTableId);
}
