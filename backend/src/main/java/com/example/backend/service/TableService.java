package com.example.backend.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.configuration.AppProperties;
import com.example.backend.dto.request.CreateTableRequest;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.Area;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.TableStatus;
import com.example.backend.mapper.TableMapper;
import com.example.backend.repository.AreaRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.utils.QrCodeGenerator;
import com.example.backend.utils.QrPdfExporter;
import com.example.backend.utils.QrPdfExporter.QrItem;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final AreaRepository areaRepository;
    private final TableMapper tableMapper;
    private final AppProperties appProps;

    public TableService(TableRepository tableRepository, 
                       AreaRepository areaRepository,
                       TableMapper tableMapper,
                       AppProperties appProps) {
        this.tableRepository = tableRepository;
        this.areaRepository = areaRepository;
        this.tableMapper = tableMapper;
        this.appProps = appProps;
    }

    /**
     * Lấy danh sách tables của owner theo branch (có phân trang)
     */
    @Transactional(readOnly = true)
    public Page<TableResponse> getOwnerTables(UUID branchId, int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        return tableRepository.findTablesByBranch(branchId, pageable);
    }

    /**
     * Lấy thông tin chi tiết 1 table
     */
    @Transactional(readOnly = true)
    public TableResponse getTableById(UUID tableId) {
        AreaTable table = tableRepository.findByIdWithDetails(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));
        
        // Map entity sang DTO bằng MapStruct
        TableResponse response = tableMapper.toTableResponse(table);
        
        // Set reservedBy nếu có reservation RESERVED
        String reservedBy = table.getReservations().stream()
                .filter(r -> "RESERVED".equals(r.getStatus().toString()))
                .findFirst()
                .map(r -> r.getCustomerName())
                .orElse(null);
        
        response.setReservedBy(reservedBy);
        
        // Set branchId từ area.branch for short URL support
        if (table.getArea() != null && table.getArea().getBranch() != null) {
            response.setBranchId(table.getArea().getBranch().getBranchId());
        }
        
        return response;
    }
    
    /**
     * Lấy thông tin table bằng tag (table name) - dùng cho short URL /t/{tableName}
     * (For backward compatibility)
     */
    @Transactional(readOnly = true)
    public TableResponse getTableByTag(String tag) {
        // Normalize tag: lowercase, trim, replace hyphens with spaces for matching
        String normalizedTag = tag.toLowerCase().trim().replace("-", " ");
        
        // Try exact match first (case-insensitive)
        AreaTable table = tableRepository.findByTagIgnoreCase(tag)
                .orElseGet(() -> {
                    // If not found, try with normalized tag (replace hyphens)
                    return tableRepository.findByTagIgnoreCase(normalizedTag)
                            .orElseThrow(() -> new NoSuchElementException("Table not found with tag: " + tag));
                });
        
        return buildTableResponse(table);
    }
    
    /**
     * Lấy thông tin table bằng branchId và tableId - dùng cho URL /t/{branchId}/{tableId}
     * Đây là format mới, unique và không bị trùng lặp
     */
    @Transactional(readOnly = true)
    public TableResponse getTableByBranchIdAndTableId(UUID branchId, UUID tableId) {
        try {
            // Use query that filters by both branchId and tableId to ensure table belongs to branch
            // This is more efficient and avoids the need to verify branchId after loading
            AreaTable table = tableRepository.findByBranchIdAndTableIdWithDetails(branchId, tableId)
                    .orElseThrow(() -> {
                        // Check if table exists at all
                        boolean tableExists = tableRepository.existsById(tableId);
                        if (!tableExists) {
                            return new NoSuchElementException("Table not found with id: " + tableId);
                        } else {
                            // Table exists but doesn't belong to the specified branch
                            // Check which branch it belongs to for better error message
                            Optional<AreaTable> tableOpt = tableRepository.findByIdWithDetails(tableId);
                            if (tableOpt.isPresent()) {
                                AreaTable t = tableOpt.get();
                                UUID actualBranchId = null;
                                try {
                                    if (t.getArea() != null && t.getArea().getBranch() != null) {
                                        actualBranchId = t.getArea().getBranch().getBranchId();
                                    }
                                } catch (Exception e) {
                                    // Ignore lazy loading errors
                                }
                                if (actualBranchId != null) {
                                    return new IllegalArgumentException("Table " + tableId + " does not belong to branch " + branchId + ". Table belongs to branch " + actualBranchId);
                                }
                            }
                            return new IllegalArgumentException("Table " + tableId + " does not belong to branch " + branchId);
                        }
                    });
            
            // Verify that area and branch are loaded (they should be from JOIN FETCH)
            // But verify to be safe and provide better error messages
            if (table.getArea() == null) {
                throw new NoSuchElementException("Table does not belong to any area");
            }
            
            if (table.getArea().getBranch() == null) {
                throw new NoSuchElementException("Table's area does not belong to any branch");
            }
            
            // Verify branchId matches (should always be true due to query filter, but double-check for safety)
            UUID tableBranchId = table.getArea().getBranch().getBranchId();
            if (!tableBranchId.equals(branchId)) {
                throw new IllegalArgumentException("Table " + tableId + " does not belong to branch " + branchId + ". Table belongs to branch " + tableBranchId);
            }
            
            // All lazy fields should be loaded by JOIN FETCH, but verify reservations are accessible
            try {
                table.getReservations().size(); // Force load reservations if not already loaded
            } catch (Exception e) {
                // If reservations can't be loaded, continue without them
                System.err.println("Warning: Could not load reservations for table " + tableId + ": " + e.getMessage());
            }
            
            // All lazy fields are now loaded, safe to map
            return buildTableResponse(table);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            // Re-throw known exceptions
            throw e;
        } catch (Exception e) {
            // Wrap unexpected exceptions with more context
            e.printStackTrace(); // Log for debugging
            throw new RuntimeException("Error retrieving table " + tableId + " for branch " + branchId + ": " + e.getMessage(), e);
        }
    }
    
    /**
     * (For backward compatibility - deprecated, use /t/{branchId}/{tableId} instead)
     */
    @Transactional(readOnly = true)
    public TableResponse getTableByAreaNameAndTag(String areaName, String tag) {
        // Normalize both area name and tag: lowercase, trim, replace hyphens with spaces for matching
        String normalizedAreaName = areaName.toLowerCase().trim().replace("-", " ");
        String normalizedTag = tag.toLowerCase().trim().replace("-", " ");
        
        // Try exact match first (case-insensitive)
        AreaTable table = tableRepository.findByAreaNameAndTagIgnoreCase(areaName, tag)
                .orElseGet(() -> {
                    // If not found, try with normalized values
                    return tableRepository.findByAreaNameAndTagIgnoreCase(normalizedAreaName, normalizedTag)
                            .orElseThrow(() -> new NoSuchElementException("Table not found with area: " + areaName + ", tag: " + tag));
                });
        
        return buildTableResponse(table);
    }
    
    /**
     * Helper method to build TableResponse from AreaTable
     */
    private TableResponse buildTableResponse(AreaTable table) {
        try {
            // Area and branch should already be loaded by JOIN FETCH, but verify
            if (table.getArea() == null) {
                throw new IllegalStateException("Table area is null - cannot build response");
            }
            
            if (table.getArea().getBranch() == null) {
                throw new IllegalStateException("Table area branch is null - cannot build response");
            }
            
            // Map entity sang DTO bằng MapStruct
            // MapStruct should handle the mapping, but area and branch must be initialized
            TableResponse response = tableMapper.toTableResponse(table);
            
            // Set reservedBy nếu có reservation RESERVED
            // Reservations should be loaded by JOIN FETCH, but handle gracefully if not
            try {
                String reservedBy = table.getReservations().stream()
                        .filter(r -> r != null && "RESERVED".equals(r.getStatus().toString()))
                        .findFirst()
                        .map(r -> r.getCustomerName())
                        .orElse(null);
                response.setReservedBy(reservedBy);
            } catch (Exception e) {
                // If reservations can't be accessed, just set null
                response.setReservedBy(null);
            }
            
            // Set branchId từ area.branch for short URL support
            // This should already be set by MapStruct, but set it explicitly to be safe
            UUID branchId = table.getArea().getBranch().getBranchId();
            response.setBranchId(branchId);
            
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Error building TableResponse: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy danh sách tables theo area
     */
    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByArea(UUID areaId) {
        List<AreaTable> tables = tableRepository.findAllByAreaId(areaId);
        
        return tables.stream()
                .map(table -> {
                    TableResponse response = tableMapper.toTableResponse(table);
                    
                    // Set reservedBy nếu có
                    String reservedBy = table.getReservations().stream()
                            .filter(r -> "RESERVED".equals(r.getStatus().toString()))
                            .findFirst()
                            .map(r -> r.getCustomerName())
                            .orElse(null);
                    
                    response.setReservedBy(reservedBy);
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Tạo table mới
     */
    @Transactional
    public TableResponse createTable(CreateTableRequest req) {
        Area area = areaRepository.findById(req.getAreaId())
                .orElseThrow(() -> new IllegalArgumentException("Area not found"));

        // Map DTO sang entity bằng MapStruct
        AreaTable table = tableMapper.toEntity(req);
        table.setArea(area);
        table.setStatus(TableStatus.FREE);

        table = tableRepository.save(table);
        
        return tableMapper.toTableResponse(table);
    }

    /**
     * Cập nhật thông tin table
     */
    @Transactional
    public TableResponse updateTable(UUID tableId, CreateTableRequest req) {
        AreaTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));
        
        // Update entity từ request bằng MapStruct
        tableMapper.updateEntityFromRequest(req, table);
        
        // Update area nếu areaId được cung cấp
        if (req.getAreaId() != null) {
            Area newArea = areaRepository.findById(req.getAreaId())
                    .orElseThrow(() -> new IllegalArgumentException("Area not found with id: " + req.getAreaId()));
            table.setArea(newArea);
        }
        
        table = tableRepository.save(table);
        
        // Force initialize area để đảm bảo areaName được load khi map
        if (table.getArea() != null) {
            table.getArea().getName(); // Trigger lazy loading
        }

        return tableMapper.toTableResponse(table);
    }

    /**
     * Cập nhật trạng thái table
     */
    @Transactional
    public TableResponse updateTableStatus(UUID tableId, TableStatus status) {
        AreaTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));
        
        table.setStatus(status);
        table = tableRepository.save(table);
        
        return tableMapper.toTableResponse(table);
    }

    /**
     * Lấy QR code PNG của table
     */
    @Transactional(readOnly = true)
    public byte[] getTableQrPng(UUID tableId, int size) {
        System.out.println("Getting QR for tableId: " + tableId); //DEBUG
        AreaTable t = tableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));

        String orderUrl = buildOrderUrl(t.getAreaTableId());
        return QrCodeGenerator.toPngBytes(orderUrl, Math.max(size, 128));
    }

    /**
     * Export QR codes PDF cho branch/area
     */
    @Transactional(readOnly = true)
    public byte[] exportBranchQrPdf(UUID branchId, UUID areaId, int cols, int sizePt) {
        List<AreaTable> tables = tableRepository.findAllByBranchAndArea(branchId, areaId);
        if (tables.isEmpty()) {
            throw new NoSuchElementException("No tables found for export");
        }

        List<QrItem> items = tables.stream()
                .map(t -> {
                    String url = buildOrderUrl(t.getAreaTableId());
                    byte[] png = QrCodeGenerator.toPngBytes(url, Math.max(sizePt, 180));
                    String label = String.format("%s • %s", t.getArea().getName(), t.getTag());
                    return new QrItem(label, png);
                })
                .collect(Collectors.toList());

        String title = "Table QR • Branch " + branchId + (areaId != null ? " • Area " + areaId : "");
        return QrPdfExporter.export(title, items, Math.max(cols, 2), sizePt);
    }

    /**
     * Xóa table
     */
    @Transactional
    public void deleteTable(UUID tableId) {
        AreaTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));
        
        // Optional: kiểm tra xem bàn có đang được sử dụng không
        if (!table.getReservations().isEmpty()) {
            throw new IllegalStateException("Cannot delete table with active reservations");
        }
        
        tableRepository.delete(table);
    }

    // ==================== PRIVATE HELPERS ====================

    private String buildOrderUrl(UUID tableId) {
        String base = appProps.getBaseUrl();
        if (base == null || base.isBlank()) {
            base = "http://localhost:5000";
        }
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/order?tableId=" + tableId;
    }

    private Pageable buildPageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "tag"));
        }
        
        String[] parts = sort.split(",", 2);
        String field = parts[0].trim();
        Sort.Direction dir = (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        
        return PageRequest.of(page, size, Sort.by(dir, field));
    }
}