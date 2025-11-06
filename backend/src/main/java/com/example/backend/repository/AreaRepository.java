package com.example.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entities.Area;

public interface AreaRepository extends JpaRepository<Area, UUID> {
    
    // Cách 1: Sử dụng method naming convention
    List<Area> findByBranchBranchId(UUID branchId);
    
    // Cách 2: Sử dụng JPQL (tùy chọn - nếu cách 1 không hoạt động)
    @Query("SELECT a FROM Area a WHERE a.branch.branchId = :branchId ORDER BY a.name ASC")
    List<Area> findAreasByBranchId(@Param("branchId") UUID branchId);
    
    // Load area with branch (eager loading) to avoid LazyInitializationException
    @Query("SELECT a FROM Area a JOIN FETCH a.branch WHERE a.areaId = :areaId")
    Optional<Area> findByIdWithBranch(@Param("areaId") UUID areaId);
    
    // Check if area with same name exists in branch (case-insensitive)
    @Query("SELECT a FROM Area a WHERE a.branch.branchId = :branchId AND LOWER(TRIM(a.name)) = LOWER(TRIM(:name)) AND a.status = true")
    Optional<Area> findByBranchBranchIdAndNameIgnoreCase(@Param("branchId") UUID branchId, @Param("name") String name);
    
    // Find or get default "Undefined Area" area for a branch
    @Query("SELECT a FROM Area a WHERE a.branch.branchId = :branchId AND LOWER(TRIM(a.name)) = LOWER(TRIM(:name))")
    Optional<Area> findByBranchBranchIdAndNameIgnoreCaseAnyStatus(@Param("branchId") UUID branchId, @Param("name") String name);
}