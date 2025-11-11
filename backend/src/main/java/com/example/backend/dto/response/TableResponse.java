package com.example.backend.dto.response;

import java.util.UUID;
import com.example.backend.entities.TableStatus;

public class TableResponse {
    private UUID id;
    private String tag;
    private int capacity;
    private TableStatus status;
    private UUID areaId; // THÊM nếu cần
    private String areaName; // THÊM nếu cần
    private UUID branchId; // ADD for short URL support

    public TableResponse(UUID id, String tag, int capacity, TableStatus status,
            UUID areaId, String areaName) {
        this.id = id;
        this.tag = tag;
        this.capacity = capacity;
        this.status = status;
        this.areaId = areaId;
        this.areaName = areaName;
    }

    public TableResponse(UUID id, String tag, int capacity, TableStatus status,
            UUID areaId, String areaName, UUID branchId) {
        this(id, tag, capacity, status, areaId, areaName);
        this.branchId = branchId;
    }

    // Constructor cũ để tương thích với repository query
    public TableResponse(UUID id, String tag, int capacity, TableStatus status) {
        this(id, tag, capacity, status, null, null);
    }

    // Default constructor cho MapStruct
    public TableResponse() {
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public String getTag() {
        return tag;
    }

    public int getCapacity() {
        return capacity;
    }

    public TableStatus getStatus() {
        return status;
    }

    public UUID getAreaId() {
        return areaId;
    }

    public String getAreaName() {
        return areaName;
    }

    // Setters - THÊM MỚI
    public void setId(UUID id) {
        this.id = id;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }

    public void setAreaId(UUID areaId) {
        this.areaId = areaId;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
}