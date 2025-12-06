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
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.AreaRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.utils.QrCodeGenerator;
import com.example.backend.utils.QrPdfExporter;
import com.example.backend.utils.QrPdfExporter.QrItem;
import com.example.backend.entities.Reservation;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.mapper.TableMapper;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final AreaRepository areaRepository;
    private final AppProperties appProps;
    private final TableMapper tableMapper;

    public TableService(TableRepository tableRepository, AreaRepository areaRepository, AppProperties appProps,
            TableMapper tableMapper) {
        this.tableRepository = tableRepository;
        this.areaRepository = areaRepository;
        this.appProps = appProps;
        this.tableMapper = tableMapper;
    }

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

        AreaTable table = new AreaTable();
        table.setArea(area);
        table.setTag(req.getTag());
        table.setCapacity(req.getCapacity());
        table.setStatus(TableStatus.FREE);

        table = tableRepository.save(table); // để có UUID

        // Không lưu Base64 vào DB theo phương án A (nhẹ DB)
        return new TableResponse(
                table.getAreaTableId(),
                table.getTag(),
                table.getCapacity(),
                table.getStatus(),
                area.getAreaId(),
                area.getName());
    }

    @Transactional(readOnly = true)
    public byte[] getTableQrPng(UUID tableId, int size) {
        AreaTable t = tableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));

        String orderUrl = buildOrderUrl(t.getAreaTableId());
        return QrCodeGenerator.toPngBytes(orderUrl, Math.max(size, 128));
    }

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

    private String buildOrderUrl(UUID tableId) {
        String base = appProps.getBaseUrl();
        if (base == null || base.isBlank())
            base = "http://localhost:5000"; // fallback khớp YAML
        if (base.endsWith("/"))
            base = base.substring(0, base.length() - 1);
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

    @Transactional
    public void deleteTable(UUID tableId) {
        AreaTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));
        
        
        // orders and reservations will be automatically deleted
        tableRepository.delete(table);
    }

    @Transactional
    public TableResponse updateTable(UUID tableId, CreateTableRequest req) {
        AreaTable table = tableRepository.findByIdWithDetails(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));

        Area area = areaRepository.findById(req.getAreaId())
                .orElseThrow(() -> new IllegalArgumentException("Area not found"));
        table.setArea(area);
        table.setTag(req.getTag());
        table.setCapacity(req.getCapacity());

        table = tableRepository.save(table);
        TableResponse response = tableMapper.toTableResponse(table);
        if (table.getArea() != null && table.getArea().getBranch() != null) {
            response.setBranchId(table.getArea().getBranch().getBranchId());
        }
        return response;
    }

    @Transactional
    public TableResponse updateTableStatus(UUID tableId, TableStatus status) {
        AreaTable table = tableRepository.findByIdWithDetails(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found"));
        
        table.setStatus(status);
        table = tableRepository.save(table);
        
        TableResponse response = tableMapper.toTableResponse(table);
        if (table.getArea() != null && table.getArea().getBranch() != null) {
            response.setBranchId(table.getArea().getBranch().getBranchId());
        }
        return response;
    }


    private TableResponse toTableResponse(AreaTable t) {
        // Use MapStruct mapper for standard field mapping and then apply small custom
        // logic
        TableResponse r = tableMapper.toTableResponse(t);


        return r;
    }

    @Transactional(readOnly = true)
    public Page<TableResponse> getPublicTablesSimple(UUID branchId, int page, int size, String sort) {
        java.util.List<AreaTable> tables = tableRepository.findAllByBranchAndArea(branchId, null);
        java.util.List<TableResponse> dtos = tables.stream().map(this::toTableResponse)
                .collect(java.util.stream.Collectors.toList());

        if (sort == null || sort.isBlank()) {
            // default already ordered by repository method
        }

        int from = Math.max(0, page * size);
        int to = Math.min(dtos.size(), from + size);
        java.util.List<TableResponse> pageContent = from <= to ? dtos.subList(from, to) : java.util.List.of();
        return new PageImpl<>(pageContent, PageRequest.of(page, size), dtos.size());
    }

}