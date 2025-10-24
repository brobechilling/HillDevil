package com.example.backend.dto.request;

import java.util.UUID;

import com.example.backend.dto.RoleDTO;

public class CreateStaffAccountRequest {
    
    private String username;
    private String password;
    private UUID branchId;
    private RoleDTO role;
    private boolean status = true;
    
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public UUID getBranchId() {
        return branchId;
    }
    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
    public boolean isStatus() {
        return status;
    }
    public void setStatus(boolean status) {
        this.status = status;
    }
    public RoleDTO getRole() {
        return role;
    }
    public void setRole(RoleDTO role) {
        this.role = role;
    }
    
}
