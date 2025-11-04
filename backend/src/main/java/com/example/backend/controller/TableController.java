package com.example.backend.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.example.backend.configuration.AppProperties;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.CreateTableRequest;
import com.example.backend.dto.response.QrCodeJsonResponse;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.TableStatus;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.TableRepository;
import com.example.backend.service.TableService;
import com.example.backend.utils.QrCodeGenerator;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner/tables")
public class TableController {

    private final TableService tableService;
    private final TableRepository tableRepository;
    private final AppProperties appProps;

    public TableController(TableService tableService, 
                          TableRepository tableRepository,
                          AppProperties appProps) {
        this.tableService = tableService;
        this.tableRepository = tableRepository;
        this.appProps = appProps;
    }

    // GET /api/owner/tables?branchId={uuid}&page=0&size=20&sort=tag,asc
    @GetMapping("")
    public ApiResponse<Page<TableResponse>> getAll(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        ApiResponse<Page<TableResponse>> res = new ApiResponse<>();
        res.setResult(tableService.getOwnerTables(branchId, page, size, sort));
        return res;
    }

    // GET /api/owner/tables/{tableId}
    @GetMapping("/{tableId}")
    public ApiResponse<TableResponse> getById(@PathVariable UUID tableId) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.getTableById(tableId));
        return res;
    }

    // GET /api/owner/tables/area/{areaId}
    @GetMapping("/area/{areaId}")
    public ApiResponse<List<TableResponse>> getByArea(@PathVariable UUID areaId) {
        ApiResponse<List<TableResponse>> res = new ApiResponse<>();
        res.setResult(tableService.getTablesByArea(areaId));
        return res;
    }

    // POST /api/owner/tables
    @PostMapping("")
    public ApiResponse<TableResponse> create(@Valid @RequestBody CreateTableRequest req) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.createTable(req));
        res.setMessage("Table created successfully");
        return res;
    }

    // PUT /api/owner/tables/{tableId}
    @PutMapping("/{tableId}")
    public ApiResponse<TableResponse> update(
            @PathVariable UUID tableId,
            @Valid @RequestBody CreateTableRequest req) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.updateTable(tableId, req));
        res.setMessage("Table updated successfully");
        return res;
    }

    // PATCH /api/owner/tables/{tableId}/status
    @PatchMapping("/{tableId}/status")
    public ApiResponse<TableResponse> updateStatus(
            @PathVariable UUID tableId,
            @RequestParam TableStatus status) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.updateTableStatus(tableId, status));
        res.setMessage("Table status updated successfully");
        return res;
    }

    // GET /api/owner/tables/{tableId}/qr.png?size=512
    @GetMapping(value = "/{tableId}/qr.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTableQrPng(
            @PathVariable UUID tableId,
            @RequestParam(defaultValue = "512") int size) {
        // Check if table exists first - return 404 without throwing exception to avoid GlobalExceptionHandler
        Optional<AreaTable> tableOpt = tableRepository.findById(tableId);
        if (tableOpt.isEmpty()) {
            // Return 404 with PNG content type (empty body) to avoid conflict with GlobalExceptionHandler
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            return new ResponseEntity<>(new byte[0], headers, HttpStatus.NOT_FOUND);
        }

        // Generate QR code directly here
        AreaTable table = tableOpt.get();
        String baseUrl = appProps.getBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "http://localhost:5000";
        }
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String orderUrl = baseUrl + "/order?tableId=" + table.getAreaTableId();
        
        byte[] png;
        try {
            png = QrCodeGenerator.toPngBytes(orderUrl, Math.max(size, 128));
        } catch (RuntimeException e) {
            // Return 500 with PNG content type instead of throwing to avoid GlobalExceptionHandler
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            return new ResponseEntity<>(new byte[0], headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDisposition(ContentDisposition.inline()
                .filename("table-" + tableId + ".png").build());
        headers.setContentLength(png.length);
        headers.setCacheControl("public, max-age=3600"); // Cache for 1 hour
        
        return new ResponseEntity<>(png, headers, HttpStatus.OK);
    }

    // GET /api/owner/tables/{tableId}/qr.json?size=512
    // Alternative endpoint returning JSON with base64 encoded image
    @GetMapping(value = "/{tableId}/qr.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<QrCodeJsonResponse> getTableQrJson(
            @PathVariable UUID tableId,
            @RequestParam(defaultValue = "512") int size) {
        ApiResponse<QrCodeJsonResponse> res = new ApiResponse<>();
        
        try {
            // Check if table exists first
            Optional<AreaTable> tableOpt = tableRepository.findById(tableId);
            if (tableOpt.isEmpty()) {
                res.setCode(ErrorCode.TABLE_NOT_FOUND.getCode());
                res.setMessage(ErrorCode.TABLE_NOT_FOUND.getMessage());
                return res;
            }

            AreaTable table = tableOpt.get();

            // Get base URL safely
            String baseUrl = null;
            if (appProps != null) {
                baseUrl = appProps.getBaseUrl();
            }
            if (baseUrl == null || baseUrl.isBlank()) {
                baseUrl = "http://localhost:5000";
            }
            if (baseUrl.endsWith("/")) {
                baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
            }
            String orderUrl = baseUrl + "/order?tableId=" + table.getAreaTableId();
            
            // Generate QR code
            String base64DataUrl;
            try {
                base64DataUrl = QrCodeGenerator.toBase64DataUrl(orderUrl, Math.max(size, 128));
            } catch (RuntimeException e) {
                res.setCode(ErrorCode.WE_COOKED.getCode());
                res.setMessage("Failed to generate QR code: " + e.getMessage());
                return res;
            }
            
            // Build response
            QrCodeJsonResponse qrResponse = new QrCodeJsonResponse();
            qrResponse.setTableId(tableId);
            qrResponse.setTableTag(table.getTag());
            qrResponse.setQrCodeBase64(base64DataUrl);
            qrResponse.setOrderUrl(orderUrl);
            qrResponse.setSize(size);
            
            res.setResult(qrResponse);
            return res;
            
        } catch (Exception e) {
            // Catch any unexpected exception
            res.setCode(ErrorCode.WE_COOKED.getCode());
            res.setMessage("Unexpected error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            // Log the full exception for debugging
            System.err.println("Error in getTableQrJson: " + e.getClass().getName());
            e.printStackTrace();
            return res;
        }
    }

    // GET /api/owner/tables/export/qr-pdf?branchId={uuid}&areaId={uuid}&cols=3&sizePt=200
    @GetMapping(value = "/export/qr-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportQrPdf(
            @RequestParam UUID branchId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(defaultValue = "3") int cols,
            @RequestParam(defaultValue = "200") int sizePt) {
        byte[] pdf = tableService.exportBranchQrPdf(branchId, areaId, cols, sizePt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("tables-qr-" + branchId + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    // DELETE /api/owner/tables/{tableId}
    @DeleteMapping("/{tableId}")
    public ApiResponse<Void> deleteTable(@PathVariable UUID tableId) {
        tableService.deleteTable(tableId);
        ApiResponse<Void> res = new ApiResponse<>();
        res.setMessage("Table deleted successfully");
        return res;
    }
}