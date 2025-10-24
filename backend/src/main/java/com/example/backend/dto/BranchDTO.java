package com.example.backend.dto;

import java.time.LocalTime;
import java.util.UUID;

public class BranchDTO {
    
    private UUID branchId;
    private String address;
    private String branchPhone;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String mail;
    private boolean isActive;
    
    
    public UUID getBranchId() {
        return branchId;
    }
    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }
    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    public String getBranchPhone() {
        return branchPhone;
    }
    public void setBranchPhone(String branchPhone) {
        this.branchPhone = branchPhone;
    }
    public LocalTime getOpeningTime() {
        return openingTime;
    }
    public void setOpeningTime(LocalTime openingTime) {
        this.openingTime = openingTime;
    }
    public LocalTime getClosingTime() {
        return closingTime;
    }
    public void setClosingTime(LocalTime closingTime) {
        this.closingTime = closingTime;
    }
    public String getMail() {
        return mail;
    }
    public void setMail(String mail) {
        this.mail = mail;
    }
    public boolean isActive() {
        return isActive;
    }
    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
    
}