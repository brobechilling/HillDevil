package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.AreaTable;

public interface TableRepository extends JpaRepository<AreaTable, UUID> {

    @Query("""
        SELECT new com.example.backend.dto.response.TableResponse(
            t.areaTableId,
            t.tag,
            t.capacity,
            t.status,
            MAX(r.customerName)
        )
        FROM AreaTable t
            JOIN t.area a
            JOIN a.branch b
            LEFT JOIN t.reservations r ON r.status = 'RESERVED'
        WHERE b.branchId = :branchId
        GROUP BY t.areaTableId, t.tag, t.capacity, t.status
        ORDER BY t.tag ASC
        """)
    Page<TableResponse> findTablesByBranch(@Param("branchId") UUID branchId, Pageable pageable);

    @Query("""
       SELECT t
       FROM AreaTable t
         JOIN t.area a
         JOIN a.branch b
       WHERE b.branchId = :branchId
         AND (:areaId IS NULL OR a.areaId = :areaId)
       ORDER BY a.name ASC, t.tag ASC
    """)
    List<AreaTable> findAllByBranchAndArea(@Param("branchId") UUID branchId,
                                           @Param("areaId") UUID areaId);
}