package com.example.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.*;
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

    public TableController(TableService tableService) {
        this.tableService = tableService;
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

    // POST /api/owner/tables - Tạo bàn + sinh QR base64 lưu DB
    @PostMapping("")
    public ApiResponse<TableResponse> create(@Valid @RequestBody CreateTableRequest req) {
        ApiResponse<TableResponse> res = new ApiResponse<>();
        res.setResult(tableService.createTable(req));
        return res;
    }

    // GET /api/owner/tables/{tableId}/qr.png?size=512 - In QR PNG lẻ
    @GetMapping(value = "/{tableId}/qr.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTableQrPng(@PathVariable UUID tableId,
            @RequestParam(defaultValue = "512") int size) {
        byte[] png = tableService.getTableQrPng(tableId, size);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDisposition(ContentDisposition.inline()
                .filename("table-" + tableId + ".png").build());
        return new ResponseEntity<>(png, headers, HttpStatus.OK);
    }

    // DELETE /api/owner/tables/{tableId} - Xóa bàn
    @DeleteMapping("/{tableId}")
    public ApiResponse<Void> deleteTable(@PathVariable UUID tableId) {
        tableService.deleteTable(tableId);
        ApiResponse<Void> res = new ApiResponse<>();
        res.setMessage("Table deleted successfully");
        return res;
    }

}
