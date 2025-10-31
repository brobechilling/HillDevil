package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.AreaResponse;
import com.example.backend.service.AreaService;

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
}