package com.example.backend.dto.response;

import java.util.UUID;

public class TableContextResponse {
    private UUID tableId;
    private String tableTag;
    private UUID branchId;
    private String branchAddress;
    private String restaurantName;
    private String publicUrl;

    public TableContextResponse() {}

    public UUID getTableId() {
        return tableId;
    }

    public void setTableId(UUID tableId) {
        this.tableId = tableId;
    }

    public String getTableTag() {
        return tableTag;
    }

    public void setTableTag(String tableTag) {
        this.tableTag = tableTag;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public String getBranchAddress() {
        return branchAddress;
    }

    public void setBranchAddress(String branchAddress) {
        this.branchAddress = branchAddress;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }
}