package com.example.backend.entities;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invalid_jwt_token")
public class InvalidJwtToken {

    @Id
    private String id;
    // we have this expirationTime for worker service (service run per period) to clean expired token, not just invalid token (when log out)
    // -> make sure the database not expand too large
    private Date expirationTime;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Date getExpirationTime() {
        return expirationTime;
    }
    
    public void setExpirationTime(Date expirationTime) {
        this.expirationTime = expirationTime;
    }

}
