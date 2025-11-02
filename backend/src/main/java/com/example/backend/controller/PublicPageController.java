package com.example.backend.controller;

import com.example.backend.dto.response.*;
import com.example.backend.service.PublicPageService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class PublicPageController {

    private final PublicPageService publicPageService;

    public PublicPageController(PublicPageService publicPageService) {
        this.publicPageService = publicPageService;
    }

    // 1. Lấy restaurant theo slug → trả về danh sách branch
    @GetMapping("/restaurant/{slug}")
    public RestaurantPublicResponse getRestaurant(@PathVariable String slug) {
        return publicPageService.getRestaurantBySlug(slug);
    }

    // 2. Lấy context từ tableId (QR)
    @GetMapping("/table/{tableId}")
    public TableContextResponse getTableContext(@PathVariable UUID tableId) {
        return publicPageService.getTableContext(tableId);
    }

    // 3. Lấy menu theo branchId
    @GetMapping("/branch/{branchId}/menu")
    public MenuPublicResponse getMenu(@PathVariable UUID branchId) {
        return publicPageService.getBranchMenu(branchId);
    }
}