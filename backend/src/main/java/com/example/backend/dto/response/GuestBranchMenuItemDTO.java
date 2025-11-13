package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public class GuestBranchMenuItemDTO {

    private UUID branchMenuItemId;
    private UUID branchId;
    private UUID menuItemId;
    private boolean available;
    private String name;
    private String description;
    private BigDecimal price;
    private UUID categoryId;
    private String imageUrl;
    private boolean bestSeller;

    public UUID getBranchMenuItemId() {
        return branchMenuItemId;
    }
    public void setBranchMenuItemId(UUID branchMenuItemId) {
        this.branchMenuItemId = branchMenuItemId;
    }
    public UUID getBranchId() {
        return branchId;
    }
    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
    public UUID getMenuItemId() {
        return menuItemId;
    }
    public void setMenuItemId(UUID menuItemId) {
        this.menuItemId = menuItemId;
    }
    public boolean isAvailable() {
        return available;
    }
    public void setAvailable(boolean available) {
        this.available = available;
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
    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    public UUID getCategoryId() {
        return categoryId;
    }
    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }
    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    public boolean isBestSeller() {
        return bestSeller;
    }
    public void setBestSeller(boolean bestSeller) {
        this.bestSeller = bestSeller;
    }

}
