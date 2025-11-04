package com.example.backend.dto;

import java.util.UUID;

public class StaffAccountDTO {
    
    private UUID staffAccountId;
    private RoleDTO role;
    private String username;
    private String password;
    private boolean status;
    private UUID branchId;
    
    public UUID getStaffAccountId() {
        return staffAccountId;
    }
    public void setStaffAccountId(UUID staffAccountId) {
        this.staffAccountId = staffAccountId;
    }
    public RoleDTO getRole() {
        return role;
    }
    public void setRole(RoleDTO role) {
        this.role = role;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public boolean isStatus() {
        return status;
    }
    public void setStatus(boolean status) {
        this.status = status;
    }
    public UUID getBranchId() {
        return branchId;
    }
    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    
}
