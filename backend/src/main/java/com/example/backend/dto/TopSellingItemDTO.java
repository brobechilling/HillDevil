package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class TopSellingItemDTO {
    private UUID menuItemId;
    private String menuItemName;
    private int quantitySold;
    private BigDecimal totalRevenue;

    public TopSellingItemDTO() {
    }

    public TopSellingItemDTO(UUID menuItemId, String menuItemName, int quantitySold, BigDecimal totalRevenue) {
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.quantitySold = quantitySold;
        this.totalRevenue = totalRevenue;
    }

    public UUID getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(UUID menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getMenuItemName() {
        return menuItemName;
    }

    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
