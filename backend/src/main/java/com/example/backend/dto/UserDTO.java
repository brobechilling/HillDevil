package com.example.backend.dto;

import java.util.UUID;

import com.example.backend.validator.Phone;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UserDTO {
    
    private UUID userId;
    @Email
    private String email;
    @Size(min = 5, max = 25, message = "username's length must be between 5 and 25")    
    private String username;
    @Phone
    private String phone;
    private RoleDTO role;
    private boolean status;
    
    public UUID getUserId() {
        return userId;
    }
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public RoleDTO getRole() {
        return role;
    }
    public void setRole(RoleDTO role) {
        this.role = role;
    }
    public boolean isStatus() {
        return status;
    }
    public void setStatus(boolean status) {
        this.status = status;
    }
    
}
