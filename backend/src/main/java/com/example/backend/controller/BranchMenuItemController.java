package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.dto.response.GuestBranchMenuItemDTO;
import com.example.backend.service.BranchMenuItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/branch-menu-items")
public class BranchMenuItemController {

    private final BranchMenuItemService branchMenuItemService;

    public BranchMenuItemController(BranchMenuItemService branchMenuItemService) {
        this.branchMenuItemService = branchMenuItemService;
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<BranchMenuItemDTO>> getMenuItemsByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<BranchMenuItemDTO>> res = new ApiResponse<>();
        res.setResult(branchMenuItemService.getMenuItemsByBranch(branchId));
        return res;
    }

    @PutMapping("/availability")
    public ApiResponse<Void> updateAvailabilityByBranchAndMenuItem(
            @RequestParam UUID branchId,
            @RequestParam UUID menuItemId,
            @RequestParam boolean available
    ) {
        branchMenuItemService.updateAvailabilityByBranchAndMenuItem(branchId, menuItemId, available);
        return new ApiResponse<>();
    }
    
    @GetMapping("/guest/branch/{branchId}")
    public ApiResponse<List<GuestBranchMenuItemDTO>> getGuestMenuItemsByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<GuestBranchMenuItemDTO>> res = new ApiResponse<>();
        res.setResult(branchMenuItemService.getListBranchMenuItems(branchId));
        return res;
    }

}
