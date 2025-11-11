package com.example.backend.service;

import java.util.List;
import java.util.NoSuchElementException;
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
import com.example.backend.repository.AreaTableRepository;
import com.example.backend.utils.QrCodeGenerator;
import com.example.backend.utils.QrPdfExporter;
import com.example.backend.utils.QrPdfExporter.QrItem;
import com.example.backend.entities.Reservation;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.mapper.TableMapper;

@Service
public class TableService {

    private final AreaTableRepository tableRepository;
    private final AreaRepository areaRepository;
    private final AppProperties appProps;
    private final TableMapper tableMapper;

    public TableService(AreaTableRepository tableRepository, AreaRepository areaRepository, AppProperties appProps,
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
        tableRepository.delete(table);
    }

    // --- Public lookup helpers used by PublicTableController ---
    @Transactional(readOnly = true)
    public TableResponse getTableById(UUID tableId) {
        AreaTable t = tableRepository.findById(tableId)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return toTableResponse(t);
    }

    @Transactional(readOnly = true)
    public TableResponse getTableByTag(String tag) {
        AreaTable t = tableRepository.findByTag(tag)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return toTableResponse(t);
    }

    @Transactional(readOnly = true)
    public TableResponse getTableByBranchIdAndTableId(UUID branchId, UUID tableId) {
        AreaTable t = tableRepository.findById(tableId)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        if (t.getArea() == null || t.getArea().getBranch() == null
                || !branchId.equals(t.getArea().getBranch().getBranchId())) {
            throw new AppException(ErrorCode.TABLE_NOT_FOUND);
        }
        return toTableResponse(t);
    }

    @Transactional(readOnly = true)
    public TableResponse getTableByAreaNameAndTag(String areaName, String tag) {
        AreaTable t = tableRepository.findByAreaNameAndTag(areaName, tag)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return toTableResponse(t);
    }

    private TableResponse toTableResponse(AreaTable t) {
        // Use MapStruct mapper for standard field mapping and then apply small custom
        // logic
        TableResponse r = tableMapper.toTableResponse(t);

        // Note: removed reservedBy population — field is not stored in DB anymore.

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