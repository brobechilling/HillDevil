package com.example.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.CreateTableRequest;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.service.TableService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner/tables")
public class TableController {

    private final TableService tableService;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    // GET /api/owner/tables?branchId={uuid}&page=0&size=20&sort=tag,asc
    @GetMapping("")
    public ApiResponse<Page<TableResponse>> getAll(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort
    ) {
        ApiResponse<Page<TableResponse>> res = new ApiResponse<>();
        res.setResult(tableService.getOwnerTables(branchId, page, size, sort));
        return res;
    }

    // POST /api/owner/tables
    // Tạo bàn + QR
    @PostMapping("")
    public ApiResponse<TableResponse> create(@Valid @RequestBody CreateTableRequest req) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.createTable(req, frontendBaseUrl));
        return res;
    }
}
