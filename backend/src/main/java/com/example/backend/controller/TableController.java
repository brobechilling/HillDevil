package com.example.backend.controller;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.configuration.AppProperties;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.CreateTableRequest;
import com.example.backend.dto.response.QrCodeJsonResponse;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.TableStatus;
import com.example.backend.service.TableService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class TableController {

    private final TableService tableService;
    private final AppProperties appProps;

    public TableController(TableService tableService, AppProperties appProps) {
        this.tableService = tableService;
        this.appProps = appProps;
    }

    @GetMapping("/owner/tables")
    public ApiResponse<Page<TableResponse>> getOwnerTables(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        ApiResponse<Page<TableResponse>> res = new ApiResponse<>();
        res.setResult(tableService.getOwnerTables(branchId, page, size, sort));
        return res;
    }

    @GetMapping("/public/tables/{branchId}")
    public ApiResponse<Page<TableResponse>> getPublicTables(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        ApiResponse<Page<TableResponse>> res = new ApiResponse<>();
        res.setResult(tableService.getOwnerTables(branchId, page, size, sort));
        return res;
    }

    @PostMapping("/owner/tables")
    public ApiResponse<TableResponse> create(@Valid @RequestBody CreateTableRequest req) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.createTable(req));
        res.setMessage("Table created successfully");
        return res;
    }

    @PutMapping("/owner/tables/{tableId}")
    public ApiResponse<TableResponse> updateTable(
            @PathVariable UUID tableId,
            @Valid @RequestBody CreateTableRequest req) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.updateTable(tableId, req));
        res.setMessage("Table updated successfully");
        return res;
    }

    @PatchMapping("/owner/tables/{tableId}/status")
    public ApiResponse<TableResponse> updateTableStatus(
            @PathVariable UUID tableId,
            @RequestParam TableStatus status) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.updateTableStatus(tableId, status));
        res.setMessage("Table status updated successfully");
        return res;
    }

    @DeleteMapping("/owner/tables/{tableId}")
    public ApiResponse<Void> deleteTable(@PathVariable UUID tableId) {
        tableService.deleteTable(tableId);
        ApiResponse<Void> res = new ApiResponse<>();
        res.setMessage("Table deleted successfully");
        return res;
    }

    @GetMapping(value = "/owner/tables/{tableId}/qr.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTableQrPng(@PathVariable UUID tableId,
            @RequestParam(defaultValue = "512") int size) {
        byte[] png = tableService.getTableQrPng(tableId, size);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDisposition(ContentDisposition.inline().filename("table-" + tableId + ".png").build());
        headers.setContentLength(png.length);
        headers.setCacheControl("public, max-age=3600");
        return new ResponseEntity<>(png, headers, HttpStatus.OK);
    }

    @GetMapping(value = "/owner/tables/{tableId}/qr.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<QrCodeJsonResponse> getTableQrJson(@PathVariable UUID tableId,
            @RequestParam(defaultValue = "512") int size) {
        ApiResponse<QrCodeJsonResponse> res = new ApiResponse<>();
        byte[] png = tableService.getTableQrPng(tableId, size);
        String base64 = java.util.Base64.getEncoder().encodeToString(png);
        String base64DataUrl = "data:image/png;base64," + base64;
        String baseUrl = appProps != null && appProps.getBaseUrl() != null && !appProps.getBaseUrl().isBlank()
                ? appProps.getBaseUrl()
                : "http://localhost:5000";
        if (baseUrl.endsWith("/"))
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        String orderUrl = baseUrl + "/order?tableId=" + tableId;
        QrCodeJsonResponse qrResponse = new QrCodeJsonResponse();
        qrResponse.setTableId(tableId);
        qrResponse.setTableTag(null);
        qrResponse.setQrCodeBase64(base64DataUrl);
        qrResponse.setOrderUrl(orderUrl);
        qrResponse.setSize(size);
        res.setResult(qrResponse);
        return res;
    }

    @GetMapping(value = "/owner/tables/export/qr-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportQrPdf(@RequestParam UUID branchId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(defaultValue = "3") int cols,
            @RequestParam(defaultValue = "200") int sizePt) {
        byte[] pdf = tableService.exportBranchQrPdf(branchId, areaId, cols, sizePt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("tables-qr-" + branchId + ".pdf").build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

}