package com.example.backend.dto.response;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.UserDTO;

public class AuthenticationResponse {
        
    private String accessToken;
    private String refreshToken;
    private UserDTO user;
    private StaffAccountDTO staff;

    public String getAccessToken() {
        return accessToken;
    }
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public UserDTO getUser() {
        return user;
    }
    public void setUser(UserDTO user) {
        this.user = user;
    }
    public StaffAccountDTO getStaff() {
        return staff;
    }
    public void setStaff(StaffAccountDTO staff) {
        this.staff = staff;
    }
    
    
}
