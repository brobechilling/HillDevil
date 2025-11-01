package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
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
    public ApiResponse<List<MenuItemDTO>> getAll() {
        ApiResponse<List<MenuItemDTO>> res = new ApiResponse<>();
        res.setResult(menuItemService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<MenuItemDTO> getById(@PathVariable UUID id) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.getById(id));
        return res;
    }

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ApiResponse<MenuItemDTO> create(
            @RequestPart("data") MenuItemCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        ApiResponse<MenuItemDTO> res = new ApiResponse<>();
        res.setResult(menuItemService.create(request, imageFile));
        return res;
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ApiResponse<MenuItemDTO> update(
            @PathVariable UUID id,
            @RequestPart("data") MenuItemCreateRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
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
            @PathVariable UUID branchId
    ) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(menuItemService.isMenuItemActiveInBranch(menuItemId, branchId));
        return res;
    }

    @PutMapping("/{menuItemId}/status")
    public ApiResponse<Void> setActiveStatus(
            @PathVariable UUID menuItemId,
            @RequestParam boolean active
    ) {
        menuItemService.setActiveStatus(menuItemId, active);
        return new ApiResponse<>();
    }
}
