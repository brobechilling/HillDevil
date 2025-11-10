package com.example.backend.dto.request;


import com.example.backend.validator.Password;

public class ForgetPasswordRequest {

    @Password
    private String password;
    private String email;

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

}
