package com.example.backend.dto;

import com.example.backend.entities.RoleName;

public class RoleDTO {

    private RoleName name;
    private String description;
    
    public RoleName getName() {
        return name;
    }
    public void setName(RoleName name) {
        this.name = name;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

}
