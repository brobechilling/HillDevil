package com.example.backend.dto.response;

import java.util.UUID;

public class ResetPasswordResponse {
    
    private UUID staffAccountId;
    private String username;
    private String newPassword; // Password gốc (plain text) để hiển thị cho admin
    
    public UUID getStaffAccountId() {
        return staffAccountId;
    }
    
    public void setStaffAccountId(UUID staffAccountId) {
        this.staffAccountId = staffAccountId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

