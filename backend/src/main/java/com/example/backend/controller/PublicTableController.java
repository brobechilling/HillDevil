package com.example.backend.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.service.TableService;

@RestController
@RequestMapping("/api/public/tables")
public class PublicTableController {

    private final TableService tableService;

    public PublicTableController(TableService tableService) {
        this.tableService = tableService;
    }

    // Public endpoint for guest access with branchId and tableId:
    // /t/{branchId}/{tableId}
    // This is the NEW format - unique and prevents conflicts
    // This MUST come FIRST to have highest priority
    @GetMapping("/{branchId}/{tableId}")
    public ApiResponse<TableResponse> getPublicTableByBranchAndTable(
            @PathVariable String branchId,
            @PathVariable String tableId) {
        ApiResponse<TableResponse> res = new ApiResponse<>();

        try {
            UUID branchUUID = UUID.fromString(branchId);
            UUID tableUUID = UUID.fromString(tableId);
            res.setResult(tableService.getTableByBranchIdAndTableId(branchUUID, tableUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format for branchId or tableId: " + e.getMessage());
        }

        return res;
    }

    // Public endpoint for guest access with area name: /t/{areaName}/{tableName}
    // (For backward compatibility - deprecated, use /t/{branchId}/{tableId}
    // instead)
    // This MUST come BEFORE /{identifier} to avoid path variable conflicts
    @GetMapping("/{areaName}/{tableName}")
    public ApiResponse<TableResponse> getPublicTableByAreaAndName(
            @PathVariable String areaName,
            @PathVariable String tableName) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.getTableByAreaNameAndTag(areaName, tableName));
        return res;
    }

    // Public listing for branch - safer simple implementation
    @GetMapping("/branch/{branchId}")
    public ApiResponse<org.springframework.data.domain.Page<TableResponse>> listPublicTablesByBranch(
            @PathVariable String branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        ApiResponse<org.springframework.data.domain.Page<TableResponse>> res = new ApiResponse<>();
        try {
            java.util.UUID branchUUID = java.util.UUID.fromString(branchId);
            res.setResult(tableService.getPublicTablesSimple(branchUUID, page, size, sort));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid branchId format");
        }
        return res;
    }

    // Public endpoint for guest access (short URL support: /t/{tableId} or
    // /t/{tableName})
    // (For backward compatibility - deprecated, use /t/{branchId}/{tableId}
    // instead)
    // This comes AFTER the two-parameter endpoints to avoid conflicts
    @GetMapping("/id/{identifier}")
    public ApiResponse<TableResponse> getPublicTable(@PathVariable String identifier) {
        ApiResponse<TableResponse> res = new ApiResponse<>();

        // Check if identifier is a UUID
        try {
            UUID tableId = UUID.fromString(identifier);
            // If it's a valid UUID, use getTableById
            res.setResult(tableService.getTableById(tableId));
        } catch (IllegalArgumentException e) {
            // If not a UUID, treat it as table name/tag (for backward compatibility)
            res.setResult(tableService.getTableByTag(identifier));
        }

        return res;
    }
}
