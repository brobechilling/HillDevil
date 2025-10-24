package com.example.backend.dto.request;

import java.util.UUID;

public class CreateStaffAccountRequest {
    
    private String username;
    private String password;
    private UUID branchId;
    private UUID roleId;
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
    public UUID getRoleId() {
        return roleId;
    }
    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }
    public boolean isStatus() {
        return status;
    }
    public void setStatus(boolean status) {
        this.status = status;
    }

    
}
