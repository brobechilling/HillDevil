package com.example.backend.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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

    // Public endpoint for guest access with area name: /t/{areaName}/{tableName}
    // This MUST come BEFORE /{identifier} to avoid path variable conflicts
    @GetMapping("/{areaName}/{tableName}")
    public ApiResponse<TableResponse> getPublicTableByAreaAndName(
            @PathVariable String areaName,
            @PathVariable String tableName) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.getTableByAreaNameAndTag(areaName, tableName));
        return res;
    }
    
    // Public endpoint for guest access (short URL support: /t/{tableId} or /t/{tableName})
    // This comes AFTER the two-parameter endpoint to avoid conflicts
    @GetMapping("/{identifier}")
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

