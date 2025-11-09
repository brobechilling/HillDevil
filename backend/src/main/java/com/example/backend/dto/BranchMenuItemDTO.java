package com.example.backend.dto;

import java.util.UUID;

public class BranchMenuItemDTO extends MenuItemDTO {
    private boolean available;
    private UUID branchId;
    private UUID branchMenuItemId;

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public UUID getBranchMenuItemId() {
        return branchMenuItemId;
    }

    public void setBranchMenuItemId(UUID branchMenuItemId) {
        this.branchMenuItemId = branchMenuItemId;
    }
}
