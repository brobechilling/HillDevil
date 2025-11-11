package com.example.backend.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(PublicTableController.class);
    private final TableService tableService;

    public PublicTableController(TableService tableService) {
        this.tableService = tableService;
    }

    // Public endpoint for guest access with branchId and tableId: /t/{branchId}/{tableId}
    // This is the NEW format - unique and prevents conflicts
    // This MUST come FIRST to have highest priority
    @GetMapping("/{branchId}/{tableId}")
    public ApiResponse<TableResponse> getPublicTableByBranchAndTable(
            @PathVariable String branchId,
            @PathVariable String tableId) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        
        try {
            logger.debug("Getting table with branchId: {}, tableId: {}", branchId, tableId);
            
            UUID branchUUID;
            UUID tableUUID;
            
            try {
                branchUUID = UUID.fromString(branchId);
            } catch (IllegalArgumentException e) {
                logger.error("Invalid UUID format for branchId: {}", branchId, e);
                throw new IllegalArgumentException("Invalid UUID format for branchId: " + branchId);
            }
            
            try {
                tableUUID = UUID.fromString(tableId);
            } catch (IllegalArgumentException e) {
                logger.error("Invalid UUID format for tableId: {}", tableId, e);
                throw new IllegalArgumentException("Invalid UUID format for tableId: " + tableId);
            }
            
            logger.debug("Parsed UUIDs - branchId: {}, tableId: {}", branchUUID, tableUUID);
            TableResponse tableResponse = tableService.getTableByBranchIdAndTableId(branchUUID, tableUUID);
            res.setResult(tableResponse);
            logger.debug("Successfully retrieved table: {}", tableResponse.getId());
            
        } catch (IllegalArgumentException | java.util.NoSuchElementException e) {
            logger.error("Error when getting table: branchId={}, tableId={}, error={}", branchId, tableId, e.getMessage(), e);
            throw e; // Re-throw to be handled by GlobalExceptionHandler
        } catch (Exception e) {
            logger.error("Unexpected error when getting table: branchId={}, tableId={}", branchId, tableId, e);
            // Log the full stack trace for debugging
            e.printStackTrace();
            throw e; // Re-throw to be handled by GlobalExceptionHandler or enable general exception handler
        }
        
        return res;
    }

    // Public endpoint for guest access with area name: /t/{areaName}/{tableName}
    // (For backward compatibility - deprecated, use /t/{branchId}/{tableId} instead)
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
    // (For backward compatibility - deprecated, use /t/{branchId}/{tableId} instead)
    // This comes AFTER the two-parameter endpoints to avoid conflicts
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

