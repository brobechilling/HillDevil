package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.BranchMenuItemDTO;
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

    @PutMapping("/{branchMenuItemId}/availability")
    public ApiResponse<Void> updateAvailability(
            @PathVariable UUID branchMenuItemId,
            @RequestParam boolean available
    ) {
        branchMenuItemService.updateAvailability(branchMenuItemId, available);
        return new ApiResponse<>();
    }
}
