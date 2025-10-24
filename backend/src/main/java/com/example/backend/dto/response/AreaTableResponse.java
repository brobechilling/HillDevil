package com.example.backend.dto.response;

import com.example.backend.entities.TableStatus;
import java.util.UUID;

/**
 * DTO response cho thông tin bàn kèm area và branch
 */
public class AreaTableResponse {

    private UUID areaTableId;
    private String tag;
    private Integer capacity;
    private TableStatus status; // Enum TableStatus
    private String qr; // Mapping với field qr trong entity

    private UUID areaId;
    private String areaName;

    private UUID branchId;
    private String branchAddress;

    /**
     * Constructor phải đúng thứ tự và kiểu dữ liệu với query trong repository
     * Thứ tự: areaTableId, tag, capacity, status, qr, areaId, areaName, branchId, branchAddress
     */
    public AreaTableResponse(UUID areaTableId, String tag, Integer capacity, TableStatus status,
                             String qr, UUID areaId, String areaName,
                             UUID branchId, String branchAddress) {
        this.areaTableId = areaTableId;
        this.tag = tag;
        this.capacity = capacity;
        this.status = status;
        this.qr = qr;
        this.areaId = areaId;
        this.areaName = areaName;
        this.branchId = branchId;
        this.branchAddress = branchAddress;
    }

    // Getters
    public UUID getAreaTableId() {
        return areaTableId;
    }

    public String getTag() {
        return tag;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public TableStatus getStatus() {
        return status;
    }

    public String getQr() {
        return qr;
    }

    public UUID getAreaId() {
        return areaId;
    }

    public String getAreaName() {
        return areaName;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public String getBranchAddress() {
        return branchAddress;
    }

    // Setters
    public void setAreaTableId(UUID areaTableId) {
        this.areaTableId = areaTableId;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }

    public void setQr(String qr) {
        this.qr = qr;
    }

    public void setAreaId(UUID areaId) {
        this.areaId = areaId;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public void setBranchAddress(String branchAddress) {
        this.branchAddress = branchAddress;
    }
}