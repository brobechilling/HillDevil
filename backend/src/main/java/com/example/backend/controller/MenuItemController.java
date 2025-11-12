package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.MenuItemDTO;
import com.example.backend.dto.request.MenuItemCreateRequest;
import com.example.backend.service.MenuItemService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping("")
    public ApiResponse<List<MenuItemDTO>> getAllByRestaurant(
            @RequestParam UUID restaurantId) {
        ApiResponse<List<MenuItemDTO>> res = new ApiResponse<>();
        res.setResult(menuItemService.getAllByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<MenuItemDTO> getById(@PathVariable UUID id) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.getById(id));
        return res;
    }

    @PostMapping(value = "/create", consumes = { "multipart/form-data" })
    public ApiResponse<MenuItemDTO> create(
            @RequestPart("data") MenuItemCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.create(request, imageFile));
        return res;
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ApiResponse<MenuItemDTO> update(
            @PathVariable UUID id,
            @RequestPart("data") MenuItemCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.update(id, request, imageFile));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        menuItemService.delete(id);
        return new ApiResponse<>();
    }

    @GetMapping("/{menuItemId}/branch/{branchId}/active")
    public ApiResponse<Boolean> isMenuItemActiveInBranch(
            @PathVariable UUID menuItemId,
            @PathVariable UUID branchId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(menuItemService.isMenuItemActiveInBranch(menuItemId, branchId));
        return res;
    }

    @PutMapping("/{menuItemId}/status")
    public ApiResponse<MenuItemDTO> setActiveStatus(
            @PathVariable UUID menuItemId,
            @RequestParam boolean active) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.setActiveStatus(menuItemId, active));
        return res;
    }

    @PutMapping("/{menuItemId}/best-seller")
    public ApiResponse<MenuItemDTO> updateBestSeller(
            @PathVariable UUID menuItemId,
            @RequestParam boolean bestSeller) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.updateBestSeller(menuItemId, bestSeller));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/can-create")
    public ApiResponse<Boolean> canCreateMenuItem(
            @PathVariable UUID restaurantId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(menuItemService.canCreateMenuItem(restaurantId));
        return res;
    }

    @GetMapping("/customization/{menuItemId}")
    public ApiResponse<List<CustomizationDTO>> getCustomizationsOfMenuItem(@PathVariable UUID menuItemId) {
        ApiResponse<List<CustomizationDTO>> response = new ApiResponse<>();
        response.setResult(menuItemService.getCustomizationOfMenuItem(menuItemId));
        return response;
    }

}
