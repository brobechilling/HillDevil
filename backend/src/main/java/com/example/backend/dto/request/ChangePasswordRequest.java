package com.example.backend.dto.request;

import java.util.UUID;

import com.example.backend.validator.Password;

public class ChangePasswordRequest {
    private String password;
    private UUID userId;
    @Password
    private String newPassword;
    
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public UUID getUserId() {
        return userId;
    }
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    public String getNewPassword() {
        return newPassword;
    }
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
}
