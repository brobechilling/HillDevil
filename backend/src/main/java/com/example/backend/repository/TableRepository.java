package com.example.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.AreaTable;

public interface TableRepository extends JpaRepository<AreaTable, UUID> {

    /**
     * Lấy danh sách tables của branch với phân trang
     * ✅ Constructor TableResponse(UUID, String, int, TableStatus, String, UUID, String)
     * Bao gồm areaId và areaName để frontend có thể hiển thị đúng tên area
     */
    @Query("""
        SELECT new com.example.backend.dto.response.TableResponse(
            t.areaTableId,
            t.tag,
            t.capacity,
            t.status,
            MAX(r.customerName),
            a.areaId,
            a.name
        )
        FROM AreaTable t
            JOIN t.area a
            JOIN a.branch b
            LEFT JOIN t.reservations r ON r.status = 'RESERVED'
        WHERE b.branchId = :branchId
        GROUP BY t.areaTableId, t.tag, t.capacity, t.status, a.areaId, a.name
        ORDER BY t.tag ASC
        """)
    Page<TableResponse> findTablesByBranch(@Param("branchId") UUID branchId, Pageable pageable);

    /**
     * Lấy tất cả tables theo branch và area (cho export PDF)
     */
    @Query("""
       SELECT t
       FROM AreaTable t
         JOIN FETCH t.area a
         JOIN FETCH a.branch b
       WHERE b.branchId = :branchId
         AND (:areaId IS NULL OR a.areaId = :areaId)
       ORDER BY a.name ASC, t.tag ASC
    """)
    List<AreaTable> findAllByBranchAndArea(@Param("branchId") UUID branchId,
                                           @Param("areaId") UUID areaId);

    /**
     * Lấy tables theo areaId
     */
    @Query("""
        SELECT t
        FROM AreaTable t
        JOIN FETCH t.area a
        WHERE a.areaId = :areaId
        ORDER BY t.tag ASC
    """)
    List<AreaTable> findAllByAreaId(@Param("areaId") UUID areaId);

    /**
     * Lấy table với eager loading (tránh N+1 query)
     */
    @Query("""
        SELECT t
        FROM AreaTable t
        LEFT JOIN FETCH t.area a
        LEFT JOIN FETCH a.branch b
        LEFT JOIN FETCH t.reservations r
        WHERE t.areaTableId = :tableId
    """)
    Optional<AreaTable> findByIdWithDetails(@Param("tableId") UUID tableId);

    /**
     * Kiểm tra table có thuộc branch không (dùng cho security)
     */
    @Query("""
        SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
        FROM AreaTable t
        JOIN t.area a
        JOIN a.branch b
        WHERE t.areaTableId = :tableId AND b.branchId = :branchId
    """)
    boolean existsByIdAndBranchId(@Param("tableId") UUID tableId,
                                   @Param("branchId") UUID branchId);

    /**
     * Tìm table bằng tag (case-insensitive) với eager loading
     * Dùng cho short URL: /t/{tableName} (old format, for backward compatibility)
     */
    @Query("""
        SELECT t
        FROM AreaTable t
        LEFT JOIN FETCH t.area a
        LEFT JOIN FETCH a.branch b
        LEFT JOIN FETCH t.reservations r
        WHERE LOWER(TRIM(t.tag)) = LOWER(TRIM(:tag))
    """)
    Optional<AreaTable> findByTagIgnoreCase(@Param("tag") String tag);

    /**
     * Tìm table bằng area name và table tag (case-insensitive) với eager loading
     * Dùng cho short URL: /t/{areaName}/{tableName}
     */
    @Query("""
        SELECT t
        FROM AreaTable t
        LEFT JOIN FETCH t.area a
        LEFT JOIN FETCH a.branch b
        LEFT JOIN FETCH t.reservations r
        WHERE LOWER(TRIM(a.name)) = LOWER(TRIM(:areaName))
          AND LOWER(TRIM(t.tag)) = LOWER(TRIM(:tag))
    """)
    Optional<AreaTable> findByAreaNameAndTagIgnoreCase(@Param("areaName") String areaName, @Param("tag") String tag);
}