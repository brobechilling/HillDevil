package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class BranchMenuItemDTO {
    private UUID menuItemId;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean bestSeller;
    private boolean hasCustomization;
    private boolean available;
    private UUID branchId;
    private UUID categoryId;

    public UUID getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(UUID menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isBestSeller() {
        return bestSeller;
    }

    public void setBestSeller(boolean bestSeller) {
        this.bestSeller = bestSeller;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isHasCustomization() {
        return hasCustomization;
    }

    public void setHasCustomization(boolean hasCustomization) {
        this.hasCustomization = hasCustomization;
    }

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

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }
}