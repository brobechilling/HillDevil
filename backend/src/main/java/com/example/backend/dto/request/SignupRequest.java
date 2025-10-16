package com.example.backend.dto.request;

import com.example.backend.validator.Password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class SignupRequest {
    @Email
    private String email;
    @Password
    private String password;
    @Size(min = 5, max = 25, message = "username's length must be between 5 and 25")
    private String username;

    private String phone;
    
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
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
}
