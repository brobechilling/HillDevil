package com.example.backend.dto.request;

public class ResetPasswordRequest {
    
    private String newPassword; // Optional: nếu null thì auto generate, nếu có thì dùng password này
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public boolean hasCustomPassword() {
        return newPassword != null && !newPassword.trim().isEmpty();
    }
}

