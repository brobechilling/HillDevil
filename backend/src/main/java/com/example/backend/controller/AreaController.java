package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.CreateAreaRequest;
import com.example.backend.dto.response.AreaResponse;
import com.example.backend.service.AreaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping("")
    public ApiResponse<List<AreaResponse>> getAreasByBranch(@RequestParam UUID branchId) {
        ApiResponse<List<AreaResponse>> res = new ApiResponse<>();
        res.setResult(areaService.getAreasByBranch(branchId));
        return res;
    }

    @PostMapping("")
    public ApiResponse<AreaResponse> createArea(@Valid @RequestBody CreateAreaRequest request) {
        try {
            ApiResponse<AreaResponse> res = new ApiResponse<>();
            res.setResult(areaService.createArea(request));
            return res;
        } catch (Exception e) {
            // Log error for debugging
            System.err.println("AreaController.createArea error: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to be handled by GlobalExceptionHandler
        }
    }

    @DeleteMapping("/{areaId}")
    public ApiResponse<Void> deleteArea(@PathVariable UUID areaId) {
        areaService.deleteArea(areaId);
        ApiResponse<Void> res = new ApiResponse<>();
        res.setMessage("Area deleted successfully");
        return res;
    }
}