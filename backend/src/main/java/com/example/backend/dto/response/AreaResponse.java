package com.example.backend.dto.response;

import java.util.UUID;

public class AreaResponse {
    private UUID areaId;
    private String name;
    private Boolean status;

    public AreaResponse(UUID areaId, String name, Boolean status) {
        this.areaId = areaId;
        this.name = name;
        this.status = status;
    }

    // Getters and Setters
    public UUID getAreaId() { return areaId; }
    public void setAreaId(UUID areaId) { this.areaId = areaId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }
}