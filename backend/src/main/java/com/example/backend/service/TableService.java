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
import com.example.backend.repository.AreaRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.utils.QrCodeGenerator;
import com.example.backend.utils.QrPdfExporter;
import com.example.backend.utils.QrPdfExporter.QrItem;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final AreaRepository areaRepository;
    private final AppProperties appProps;

    public TableService(TableRepository tableRepository, AreaRepository areaRepository, AppProperties appProps) {
        this.tableRepository = tableRepository;
        this.areaRepository = areaRepository;
        this.appProps = appProps;
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
                null);
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

        // (tùy chọn) kiểm tra xem bàn có đang được sử dụng trong reservation/order
        // nếu có -> throw exception để không cho xóa
        // if (!table.getReservations().isEmpty()) {
        // throw new IllegalStateException("Cannot delete a table with active
        // reservations");
        // }

        tableRepository.delete(table);
    }

}