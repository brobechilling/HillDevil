package com.example.backend.controller;


import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.BranchDTO;
import com.example.backend.service.BranchService;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping("")
    public ApiResponse<List<BranchDTO>> getAll() {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<BranchDTO> getById(@PathVariable UUID id) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.getById(id));
        return res;
    }

    @PostMapping("")
    public ApiResponse<BranchDTO> create(@RequestBody BranchDTO dto) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.create(dto));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<BranchDTO> update(@PathVariable UUID id, @RequestBody BranchDTO dto) {
        ApiResponse<BranchDTO> res = new ApiResponse<>();
        res.setResult(branchService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        ApiResponse<Void> res = new ApiResponse<>();
        branchService.delete(id);
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ApiResponse<List<BranchDTO>> getByRestaurant(@PathVariable UUID restaurantId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/active")
    public ApiResponse<List<BranchDTO>> getActiveByRestaurant(@PathVariable UUID restaurantId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getActiveByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/{branchId}/restaurant")
    public ApiResponse<UUID> getRestaurantByBranchId(@PathVariable UUID branchId) {
        ApiResponse<UUID> res = new ApiResponse<>();
        res.setResult(branchService.getRestaurantIdByBranchId(branchId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/can-create")
    public ApiResponse<Boolean> canCreateBranch(@PathVariable UUID restaurantId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(branchService.canCreateBranch(restaurantId));
        return res;
    }

    @GetMapping("/owner/{ownerId}")
    public ApiResponse<List<BranchDTO>> getBranchesByOwner(@PathVariable UUID ownerId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getBranchesByOwner(ownerId));
        return res;
    }
}
