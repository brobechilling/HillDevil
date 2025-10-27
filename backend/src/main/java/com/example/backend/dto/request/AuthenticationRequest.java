package com.example.backend.dto.request;

import java.util.UUID;

public class AuthenticationRequest {

    // default to be white space if not pass
    private String email = "";
    private String password;
    // user name is for staffaccount login
    private String username = "";
    private UUID branchId = null;

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
    
}
