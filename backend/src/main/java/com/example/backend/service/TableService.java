package com.example.backend.service;

import java.util.UUID;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.CreateTableRequest;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.Area;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.TableStatus;
import com.example.backend.repository.AreaRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.utils.QrCodeGenerator;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final AreaRepository areaRepository;

    public TableService(TableRepository tableRepository, AreaRepository areaRepository) {
        this.tableRepository = tableRepository;
        this.areaRepository = areaRepository;
    }

    @Transactional(readOnly = true)
    public Page<TableResponse> getOwnerTables(UUID branchId, int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        return tableRepository.findTablesByBranch(branchId, pageable);
    }

    @Transactional
    public TableResponse createTable(CreateTableRequest req, String frontendBaseUrl) {
        Area area = areaRepository.findById(req.getAreaId())
                .orElseThrow(() -> new IllegalArgumentException("Area not found"));

        // tạo entity
        AreaTable table = new AreaTable();
        table.setArea(area);
        table.setTag(req.getTag());
        table.setCapacity(req.getCapacity());
        table.setStatus(TableStatus.FREE);

        // Lưu lần 1 để có UUID
        table = tableRepository.save(table);

        // Tạo URL order cho khách
        String orderUrl = (frontendBaseUrl.endsWith("/") ? frontendBaseUrl.substring(0, frontendBaseUrl.length()-1) : frontendBaseUrl)
                + "/order?tableId=" + table.getAreaTableId();

        // Sinh QR base64 và lưu
        table.setQr(QrCodeGenerator.toBase64Png(orderUrl));
        table = tableRepository.save(table); // lưu lại QR

        return new TableResponse(
            table.getAreaTableId(),
            table.getTag(),
            table.getCapacity(),
            table.getStatus(),
            null
        );
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
