package com.example.backend.dto.request;

import jakarta.validation.constraints.Email;

public class OTPMailRequest {
    @Email
    private String mail;
    private String name;

    public String getMail() {
        return mail;
    }
    public void setMail(String mail) {
        this.mail = mail;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    
        
}
